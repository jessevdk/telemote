from twisted.web import server, resource, static
from twisted.internet import reactor

import threading, rb, os
import source
import player

class Root(resource.Resource):
    isLeaf = False

    def __init__(self, datadir):
        resource.Resource.__init__(self)
        self.datadir = datadir

    def render_GET(self, request):
        pass

    def getChild(self, path, request):
        return static.File(os.path.join(self.datadir, 'static', 'index.html'))

class WebServer(threading.Thread):
    def __init__(self, shell, datadir, port=8888):
        threading.Thread.__init__(self)

        self.shell = shell
        self.port = port
        self.site = Root(datadir)

        self.site.putChild("static", static.File(os.path.join(datadir, 'static')))
        self.site.putChild("playlist", source.Sources(self.shell))
        self.site.putChild("player", player.Player(self.shell))

    def run(self):
        reactor.listenTCP(self.port, server.Site(self.site))
        reactor.run(installSignalHandlers=False)

    def stop(self):
        reactor.stop()

# vi:ex:ts=4:et
