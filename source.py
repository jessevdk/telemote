from gi.repository import RB

from twisted.web import resource
import json

from artist import Artists
from collection import Collection
import utils

class Source(resource.Resource):
    Multiple = False

    def __init__(self, base, id, source):
        resource.Resource.__init__(self)

        self.base = base
        self.id = id
        self.source = source

        self.model = self.source.props.base_query_model

        self.putChild('artist', Artists(self))

    def render_GET(self, request):
        return json.dumps(utils.render_entries(self.model))

    def getChild(self, path, request):
        return self

class Sources(Collection):
    def __init__(self, shell):
        Collection.__init__(self, Source)

        self.shell = shell
        self.sources = {}
        self.sources_rev = {}
        self.source_id = 0

        self.add_source(self.shell.props.queue_source)
        self.add_source(self.shell.props.library_source)

        pm = self.shell.get_playlist_manager()

        for pl in pm.get_playlists():
            self.add_source(pl)

        pm.connect('playlist-added', self.on_playlist_added)

    def entity(self, id):
        return self.sources[id]

    def on_playlist_added(self, pm, playlist):
        self.add_source(playlist)

    def remove_source(self, playlist):
        id = self.sources_rev[playlist]

        del self.sources_rev[playlist]
        del self.sources[id]

    def on_source_deleted(self, source):
        self.remove_source(source)

    def add_source(self, source):
        self.sources[self.source_id] = source
        self.sources_rev[source] = self.source_id
        self.source_id += 1

        source.connect('deleted', self.on_source_deleted)

    def format_source(self, id):
        pl = self.sources[id]

        return [
            id,
            pl.props.name
        ]

    def render_GET(self, request):
        ret = [self.format_source(x) for x in self.sources]
        ret.sort(key=lambda x: x[0])

        return json.dumps({
            'header': ['id', 'name'],
            'items': ret
        });

        return json.dumps(ret)

# vi:ex:ts=4:et
