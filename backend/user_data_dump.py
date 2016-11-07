#!/bin/python
from user import User
from group import Group

class UserDataDump:
    def __init__(self, id, user, type, owner, group, data, status):
        self.id = id
        self.user = user
        self.type = type
        self.owner = owner
        self.group = group
        self.data = data
        self.status = status
