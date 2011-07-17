from twisted.web import resource

class Collection(resource.Resource):
    def __init__(self, child_type):
        resource.Resource.__init__(self)

        self.child_type = child_type

    def entity(self, id):
        return None

    def getChild(self, name, request):
        if name == '':
            return self

        id = int(name)

        return self.child_type(self, id, self.entity(id))

# vi:ex:ts=4:et
