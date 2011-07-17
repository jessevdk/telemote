from twisted.web import resource
from collection import Collection

from gi.repository import RB
import json

import telemotec
import utils

class Artist(resource.Resource):
    def __init__(self, artists, id, artist):
        self.artists = artists
        self.id = id
        self.artist = artist

    def render_GET(self, request):
        pass

class Artists(Collection):
    def __init__(self, source):
        Collection.__init__(self, Artist)

        self.source = source

        self.populate()

    def populate(self):
        db = self.source.source.props.base_query_model.props.db
        model = self.source.source.props.base_query_model

        self.model = RB.RhythmDBPropertyModel.new(db, RB.RhythmDBPropType.ARTIST)
        self.model.props.query_model = model

        #utils.run_in_main(telemotec.query_model_do, db, self.query_model)

        iter = self.model.get_iter_first()

        self.artists = []

        while iter:
            self.artists.append([self.model.get_value(iter, 0),
                                 self.model.get_value(iter, 1),
                                 self.model.get_value(iter, 2)])

            iter = self.model.iter_next(iter)

    def entity(self, id):
        return self.artists[id]

    def render_GET(self, request):
        ret = {
            'header': ['id', 'name', 'is-all', 'n'],
            'items': []
        }

        i = 0
        items = []

        for artist in self.artists:
            items.append([i, artist[0], artist[1], artist[2]])
            i += 1

        ret['items'] = items

        return json.dumps(ret)

# vi:ex:ts=4:et
