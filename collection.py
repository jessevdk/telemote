from twisted.web import resource

class Collection(resource.Resource):
    def __init__(self, child_type):
        resource.Resource.__init__(self)

        self.child_type = child_type

    def entity(self, id):
        return None

    def create_child(self, id):
        return self.child_type(self, id, self.entity(id))

    def getChild(self, name, request):
        if name == '':
            return self

        if ',' in name:
            id = [int(x) for x in name.split(',')]
        else:
            id = [int(name)]

        if not hasattr(self.child_type, 'Multiple') or not self.child_type.Multiple:
            id = id[0]

        return self.create_child(id)

# vi:ex:ts=4:et
