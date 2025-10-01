"""
API views for timetable management
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    TimetableTemplate, TimeSlot, ScheduledClass, TimetableConstraint,
    ConflictLog, TeachingPracticeSchedule, FieldworkSchedule
)
from .serializers import (
    TimetableTemplateSerializer, TimeSlotSerializer, ScheduledClassSerializer,
    TimetableConstraintSerializer, ConflictLogSerializer,
    TeachingPracticeScheduleSerializer, FieldworkScheduleSerializer
)
from .tasks import generate_timetable_task


class TimetableTemplateViewSet(viewsets.ModelViewSet):
    queryset = TimetableTemplate.objects.all()
    serializer_class = TimetableTemplateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['semester', 'program', 'status']
    search_fields = ['name']
    ordering_fields = ['-created_at']

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Trigger timetable generation"""
        timetable = self.get_object()

        if timetable.status in ['GENERATING']:
            return Response(
                {'error': 'Timetable generation already in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update status
        timetable.status = 'GENERATING'
        timetable.save()

        # Trigger async task
        task = generate_timetable_task.delay(timetable.id)

        return Response({
            'message': 'Timetable generation started',
            'task_id': task.id
        })

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish generated timetable"""
        timetable = self.get_object()

        if timetable.status != 'GENERATED':
            return Response(
                {'error': 'Only generated timetables can be published'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.utils import timezone
        timetable.status = 'PUBLISHED'
        timetable.published_at = timezone.now()
        timetable.save()

        return Response({'message': 'Timetable published successfully'})

    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """Export timetable to PDF/Excel"""
        timetable = self.get_object()
        format_type = request.query_params.get('format', 'pdf')

        if format_type == 'pdf':
            from .utils.export import export_to_pdf
            file_path = export_to_pdf(timetable)
        elif format_type == 'excel':
            from .utils.export import export_to_excel
            file_path = export_to_excel(timetable)
        else:
            return Response({'error': 'Invalid format'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Export successful',
            'file_url': file_path
        })


class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['timetable', 'day_of_week']


class ScheduledClassViewSet(viewsets.ModelViewSet):
    queryset = ScheduledClass.objects.all()
    serializer_class = ScheduledClassSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['timetable', 'course', 'faculty', 'room', 'time_slot']


class TimetableConstraintViewSet(viewsets.ModelViewSet):
    queryset = TimetableConstraint.objects.all()
    serializer_class = TimetableConstraintSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['timetable', 'constraint_type', 'is_active']


class ConflictLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ConflictLog.objects.all()
    serializer_class = ConflictLogSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['timetable', 'conflict_type', 'resolved']


class TeachingPracticeScheduleViewSet(viewsets.ModelViewSet):
    queryset = TeachingPracticeSchedule.objects.all()
    serializer_class = TeachingPracticeScheduleSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['timetable', 'faculty']


class FieldworkScheduleViewSet(viewsets.ModelViewSet):
    queryset = FieldworkSchedule.objects.all()
    serializer_class = FieldworkScheduleSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['timetable', 'course', 'faculty_supervisor']
