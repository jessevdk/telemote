import threading
from gi.repository import GObject, RB

def _run_idle(cond, fun, *args):
    cond.acquire()
    cond.retval = fun(*args)
    cond.notify()
    cond.release()

    return False

def run_in_main(fun, *args):
    cond = threading.Condition()

    cond.retval = None
    cond.acquire()

    GObject.idle_add(lambda: _run_idle(cond, fun, *args))

    cond.wait()
    ret = cond.retval
    cond.release()

    return ret

def render_entry(entry):
    if not entry:
        return []

    return [
        entry.get_ulong(RB.RhythmDBPropType.ENTRY_ID),
        entry.get_string(RB.RhythmDBPropType.TITLE),
        entry.get_ulong(RB.RhythmDBPropType.TRACK_NUMBER),
        entry.get_string(RB.RhythmDBPropType.ARTIST),
        entry.get_string(RB.RhythmDBPropType.ALBUM),
        entry.get_ulong(RB.RhythmDBPropType.DURATION),
        entry.get_ulong(RB.RhythmDBPropType.PLAY_COUNT),
    ]

def entry_header():
    return ['id', 'name', 'track', 'artist', 'album', 'duration', 'count']

def render_entries(model):
    iter = model.get_iter_first()

    ret = {'header': entry_header()}

    items = []

    while iter:
        entry = model.iter_to_entry(iter)
        it = render_entry(entry)

        items.append(it)

        iter = model.iter_next(iter)

    ret['items'] = items

    return ret

# vi:ex:ts=4:et
