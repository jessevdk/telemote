import threading
from gi.repository import GObject

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

# vi:ex:ts=4:et
