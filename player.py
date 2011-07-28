from gi.repository import RB

from twisted.web import resource
import json

from method import Method
import utils
import telemotec
import sys

class Player(Method):
    def __init__(self, shell, sources):
        Method.__init__(self)

        self.shell = shell
        self.sources = sources
        self.player = shell.get_player()

    def _method_play_PUT(self, args, request):
        r, playing = self.player.get_playing()

        if not playing:
            utils.run_in_main(self.player.playpause, False)

    def _method_seek_PUT(self, args, request):
        offset = int(args[0])
        utils.run_in_main(self.player.seek, offset)

    def _method_next_PUT(self, args, request):
        utils.run_in_main(self.player.do_next)

    def _method_previous_PUT(self, args, request):
        utils.run_in_main(self.player.do_previous)

    def _method_pause_PUT(self, args, request):
        self.player.pause()

    def _method_mute_PUT(self, args, request):
        if int(args[0]):
            mute = True
        else:
            mute = False

        utils.run_in_main(self.player.set_mute, mute)

    def _method_repeat_PUT(self, args, request):
        ret, shuffle, repeat = self.player.get_playback_state()

        if int(args[0]):
            repeat = True
        else:
            repeat = False

        utils.run_in_main(self.player.set_playback_state, shuffle, repeat)

    def _method_volume_PUT(self, args, request):
        utils.run_in_main(self.player.set_volume, float(args[0]))

    def _method_repeat_GET(self, args, request):
        ret, shuffle, repeat = self.player.get_playback_state()

        return json.dumps(repeat)

    def _method_shuffle_PUT(self, args, request):
        ret, shuffle, repeat = self.player.get_playback_state()

        if int(args[0]):
            shuffle = True
        else:
            shuffle = False

        self.player.set_playback_state(shuffle, repeat)

    def _method_shuffle_GET(self, args, request):
        ret, shuffle, repeat = self.player.get_playback_state()

        return json.dumps(shuffle)

    def _method_queue_PUT(self, args, request):
        for id in args[0].split(','):
            id = id.strip()

            if not id:
                continue

            entry = self.shell.props.db.entry_lookup_by_id(int(id))
            self.shell.add_to_queue(entry.get_string(RB.RhythmDBPropType.LOCATION))

    def _method_queue_GET(self, args, request):
        source = self.shell.props.queue_source
        entries = utils.render_entries(source.props.base_query_model)

        return json.dumps(entries)

    def _method_dequeue_PUT(self, args, request):
        for id in args[0].split(','):
            id = id.strip()

            if not id:
                continue

            entry = self.shell.props.db.entry_lookup_by_id(int(id))

            utils.run_in_main(self.shell.remove_from_queue, entry.get_string(RB.RhythmDBPropType.LOCATION))

    def _method_playlist_PUT(self, args, request):
        srcid = int(args[0])

        a = []

        # Build a query model
        for id in args[1].split(','):
            id = id.strip()

            if not id:
                continue

            if len(a) > 0:
                a.append(RB.RhythmDBQueryType.DISJUNCTIVE_MARKER)

            a.extend([RB.RhythmDBQueryType.EQUALS,
                      RB.RhythmDBPropType.ENTRY_ID,
                      int(id)])

        db = self.shell.props.db
        model = telemotec.query_model_new(db, *a)
        utils.run_in_main(telemotec.query_model_do, db, model)

        source = self.sources.source(srcid)

        source.props.query_model = model
        self.player.props.source = source

    def getChild(self, name, request):
        if name == 'seek':
            return Seek(self)
        else:
            return Method.getChild(self, name, request)

    def render_GET(self, request):
        ret = Method.render_GET(self, request)

        if ret:
            return ret

        entry = self.player.get_playing_entry()

        header = utils.entry_header()
        header.append('time')

        item = utils.render_entry(entry)

        r, shuffle, repeat = self.player.get_playback_state()

        if entry:
            [r, t] = self.player.get_playing_time()
            item.append(t)

        ret = {'header': header, 'current': item, 'repeat': repeat, 'shuffle': shuffle, 'playing': self.player.props.playing}

        return json.dumps(ret)

# vi:ex:ts=4:et
