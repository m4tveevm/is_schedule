from http import HTTPStatus

from rest_framework.response import Response


def health(request):
    return Response("<p>Alive<p/>", status=HTTPStatus.OK)
