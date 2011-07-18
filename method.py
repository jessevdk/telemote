from gi.repository import RB

from twisted.web import resource
import json

class Method(resource.Resource):
    def __init__(self):
        resource.Resource.__init__(self)

    def call_method(self, tp, request):
        meth = '_method_%s_%s' % (self.method, tp)

        if not hasattr(self, meth):
            return False

        at = getattr(self, meth)

        if not callable(at):
            return False

        return at(request)

    def render_GET(self, request):
        return self.call_method('GET', request)

    def render_POST(self, request):
        return self.call_method('POST', request)

    def render_HEAD(self, request):
        return self.call_method('HEAD', request)

    def render_PUT(self, request):
        return self.call_method('PUT', request)

    def render_DELETE(self, request):
        return self.call_method('DELETE', request)

    def getChild(self, name, request):
        self.method = name
        return self

# vi:ex:ts=4:et
