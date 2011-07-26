from twisted.web import resource
from collection import Collection

from gi.repository import RB
import json

import telemotec
import utils

class Album(resource.Resource):
    Multiple = True

    def __init__(self, base, ids, albums):
        resource.Resource.__init__(self)

        self.base = base

        self.ids = ids
        self.albums = albums

        self.build_model()

    def build_model(self):
        db = self.base.model.props.db

        args = []

        for i in xrange(len(self.albums)):
            album = self.albums[i]

            if i != 0:
                args.append(RB.RhythmDBQueryType.DISJUNCTIVE_MARKER)

            args.extend([RB.RhythmDBQueryType.EQUALS,
                         RB.RhythmDBPropType.ALBUM,
                         album[0]])

        self.model = telemotec.query_model_new(db, *args)
        self.model.chain(self.base.model, False)

        utils.run_in_main(telemotec.query_model_do, db, self.model)

    def render_GET(self, request):
        return json.dumps(utils.render_entries(self.model))

class Albums(Collection):
    def __init__(self, base):
        Collection.__init__(self, Album)

        self.base = base

        self.populate()

    def populate(self):
        self.model = self.base.model
        db = self.model.props.db

        self.property_model = RB.RhythmDBPropertyModel.new(db, RB.RhythmDBPropType.ALBUM)
        self.property_model.props.query_model = self.model

        iter = self.property_model.get_iter_first()

        self.albums = []

        while iter:
            self.albums.append([self.property_model.get_value(iter, 0),
                                self.property_model.get_value(iter, 1),
                                self.property_model.get_value(iter, 2)])

            iter = self.property_model.iter_next(iter)

    def entity(self, ids):
        return [self.albums[id] for id in ids]

    def render_GET(self, request):
        ret = {
            'header': ['id', 'name', 'is-all', 'n'],
            'items': []
        }

        i = 0
        items = []

        for album in self.albums:
            items.append([i, album[0], album[1], album[2]])
            i += 1

        ret['items'] = items

        return json.dumps(ret)

# vi:ex:ts=4:et
