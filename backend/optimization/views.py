"""
API views for optimization tasks
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from celery.result import AsyncResult


@api_view(['GET'])
def get_task_status(request, task_id):
    """Get the status of a Celery task"""
    task = AsyncResult(task_id)

    response_data = {
        'task_id': task_id,
        'status': task.state,
        'result': None
    }

    if task.state == 'SUCCESS':
        response_data['result'] = task.result
    elif task.state == 'FAILURE':
        response_data['error'] = str(task.info)

    return Response(response_data)
