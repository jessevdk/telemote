from twisted.web import server, resource
from twisted.internet import reactor

import threading

class Site(resource.Resource):
    isLeaf = True

    def render_GET(self, request):
        pass

class WebServer(threading.Thread):
    def __init__(self, port=8888):
        threading.Thread.__init__(self)

        self.port = port
        self.site = server.Site(Site)

    def run(self):
        reactor.listenTCP(self.port, self.site)
        reactor.run(installSignalHandlers=False)

    def stop(self):
        # TODO
        pass

# vi:ex:ts=4:et
