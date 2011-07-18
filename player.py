from gi.repository import RB

from twisted.web import resource
import json

from method import Method
import utils

class Seek(resource.Resource):
    def __init__(self, base):
        resource.Resource.__init__(self)
        self.base = base

    def render_PUT(self, request):
        self.base.player.seek(self.offset)
        return '{}'

    def getChild(self, name, request):
        self.offset = int(name)
        return self

class Player(Method):
    def __init__(self, shell):
        Method.__init__(self)

        self.shell = shell
        self.player = shell.get_player()

    def _method_next_PUT(self, request):
        self.player.do_next()

    def _method_previous_PUT(self, request):
        self.player.do_previous()

    def _method_pause_PUT(self, request):
        self.player.pause()

    def _method_play_PUT(self, request):
        self.player.play()

    def getChild(self, name, request):
        if name == 'seek':
            return Seek(self)
        else:
            return Method.getChild(self, name, request)

    def render_GET(self, request):
        entry = self.player.get_playing_entry()

        header = utils.entry_header()
        header.append('time')

        item = utils.render_entry(entry)

        if entry:
            [r, t] = self.player.get_playing_time()
            item.append(t)

        ret = {'header': header, 'current': item}

        return json.dumps(ret)

# vi:ex:ts=4:et
