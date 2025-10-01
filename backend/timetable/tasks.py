"""
Celery tasks for async timetable generation
"""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def generate_timetable_task(self, timetable_id):
    """
    Async task to generate timetable
    This runs in the background to avoid blocking the API
    """
    from .models import TimetableTemplate, TimeSlot, ScheduledClass
    from optimization.services import TimetableGeneratorService

    try:
        logger.info(f"Starting timetable generation for ID: {timetable_id}")

        timetable = TimetableTemplate.objects.get(id=timetable_id)

        # Initialize generator service
        generator = TimetableGeneratorService(timetable)

        # Generate timetable
        result = generator.generate()

        if result['status'] in ['OPTIMAL', 'FEASIBLE']:
            timetable.status = 'GENERATED'
            timetable.optimization_score = result.get('objective_value')
            timetable.generation_time_seconds = result.get('solve_time')
        else:
            timetable.status = 'DRAFT'
            logger.error(f"Failed to generate timetable: {result.get('status')}")

        timetable.save()

        logger.info(f"Timetable generation completed for ID: {timetable_id}")

        return {
            'timetable_id': timetable_id,
            'status': result['status'],
            'schedule_count': len(result.get('schedule', []))
        }

    except Exception as e:
        logger.error(f"Error generating timetable {timetable_id}: {str(e)}")
        TimetableTemplate.objects.filter(id=timetable_id).update(status='DRAFT')
        raise
