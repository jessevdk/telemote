from gi.repository import GObject, Peas

from webserver import WebServer
import os

class TeleMotePlugin(GObject.Object, Peas.Activatable):
    __gtype_name__ = 'TeleMotePlugin'

    object = GObject.property(type=GObject.Object)

    def __init__(self):
        GObject.Object.__init__(self)

    def do_activate(self):
        self.server = WebServer(self.object, os.path.dirname(os.path.realpath(__file__)))
        self.server.start()

    def do_deactivate(self):
        self.server.stop()

# vi:ex:ts=4:et
