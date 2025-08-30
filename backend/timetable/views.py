from http import HTTPStatus

from django.http import HttpResponse


def health(request):
    return HttpResponse("<p>Alive<p/>", status=HTTPStatus.OK)
