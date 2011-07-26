from twisted.web import resource
from collection import Collection

from gi.repository import RB
import json

import telemotec
import utils

from album import Albums

class Artist(resource.Resource):
    Multiple = True

    def __init__(self, base, ids, artists):
        resource.Resource.__init__(self)

        self.base = base

        self.ids = ids
        self.artists = artists

        self.build_model()

        self.putChild('album', Albums(self))

    def build_model(self):
        db = self.base.model.props.db

        args = []
        isall = False

        for i in xrange(len(self.artists)):
            artist = self.artists[i]

            if artist[1]:
                args = []
                isall = True
                break

            if i != 0:
                args.append(RB.RhythmDBQueryType.DISJUNCTIVE_MARKER)

            args.extend([RB.RhythmDBQueryType.EQUALS,
                         RB.RhythmDBPropType.ARTIST,
                         artist[0]])

        self.model = telemotec.query_model_new(db, *args)
        telemotec.query_model_set_sorted(self.model)

        if isall:
            self.model.copy_contents(self.base.model)
        else:
            self.model.chain(self.base.model, False)

        utils.run_in_main(telemotec.query_model_do, db, self.model)

    def render_GET(self, request):
        return json.dumps(utils.render_entries(self.model))

    def getChild(self, path, request):
        return self

class Artists(Collection):
    def __init__(self, base):
        Collection.__init__(self, Artist)

        self.base = base
        self.model = base.model

        self.populate()

    def populate(self):
        db = self.model.props.db

        self.property_model = RB.RhythmDBPropertyModel.new(db, RB.RhythmDBPropType.ARTIST)
        self.property_model.props.query_model = self.model

        iter = self.property_model.get_iter_first()

        self.artists = []

        while iter:
            self.artists.append([self.property_model.get_value(iter, 0),
                                 self.property_model.get_value(iter, 1),
                                 self.property_model.get_value(iter, 2)])

            iter = self.property_model.iter_next(iter)

    def entity(self, ids):
        return [self.artists[id] for id in ids]

    def render_GET(self, request):
        ret = {
            'header': ['id', 'name', 'is-all', 'count'],
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
