from rest_framework import viewsets
from .models import items
from .serializer import itemsSerializer

class itemViewSet(viewsets.ModelViewSet):
    queryset = items.objects.all()
    serializer_class = itemsSerializer
