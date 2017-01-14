#!/usr/bin/python
import rethinkdb as r
from rethinkdb.errors import RqlRuntimeError, RqlDriverError
import json
import jsonpickle
from flask import Flask, g, jsonify, request, abort, render_template
from flask_cors import CORS, cross_origin
from user_data_dump import UserDataDump
from user import User
from group import Group
from type import Type

RDB_HOST='localhost'
RDB_PORT='28015'
RDB_NAME='dump_it'
USERS = None
GROUPS = None
TYPES = {
        1: 'LINK',
        2: 'INFO'
    }
STATUSES = {
        0: 'UNREAD',
        1: 'READ',
        2: 'DELETED'
    }

app = Flask(__name__)
CORS(app)

@app.before_request
def before_request():
    g.rdb_conn = get_connection()

def get_connection():
    try:
        return r.connect(host=RDB_HOST, port=RDB_PORT, db=RDB_NAME)
    except RqlDriverError:
        abort(503, "No database connection could be established.")

@app.teardown_request
def teardown_request(exception):
    close_connection(g.rdb_conn)

def close_connection(conn):
    try:
        conn.close()
    except AttributeError:
        pass

@app.route('/getAllData')
def get_all_data():
    user_id = get_user_id()
    data = list(r.table('user_group_map').filter({'user_id': user_id}).inner_join(r.table('data_dump'),
        lambda ugm, dd:
            ugm['group_id'] == dd['group_id']
    ).zip().run(g.rdb_conn))
    user = get_user(user_id)
    return get_user_data_dump(data, user)

@app.route('/updateStatus')
def update_status():
    user_id = str(get_user_id())
    status_id = int(request.args.get('status_id'))
    data_dump_id = int(request.args.get('data_dump_id'))
    if(status_id == 0):
        r.table('data_dump').filter({'id': data_dump_id}).replace(r.row.without(user_id)).run(g.rdb_conn)    
    else:
        r.table('data_dump').filter({'id': data_dump_id}).update({user_id: status_id}).run(g.rdb_conn)
    return str(status_id)

# @app.route('/addData')
# def add_data():
#     user_id = get_user_id()
#     user_data_dump  = jsonpickle.decode(request.args.get('user_data_dump'))
#     r.table('data_dump').filter({'id': data_dump_id}).update({user_id: status_id}).run(g.rdb_conn)
#     return ''

@app.route('/users')
def get_users():
    data = list(r.table('user_group_map').eq_join('user_id', r.table('user')).zip()
            .map(
                lambda data_row: {
                    'user_display_name': data_row['name'],
                    'user_name': data_row['username'],
                    'user_id': data_row['user_id'],
                    'group_id': data_row['group_id']
                }
            ).eq_join('group_id', r.table('group')).zip()
            .map(
                lambda data_row: {
                    'user_display_name': data_row['user_display_name'],
                    'user_name': data_row['user_name'],
                    'user_id': data_row['user_id'],
                    'group_id': data_row['group_id'],
                    'group_display_name': data_row['name'],
                    'group_user_name': data_row['username']
                }
            ).run(g.rdb_conn))
    return jsonpickle.encode(data)

def get_user(user_id):
    global USERS
    if USERS is None:
        USERS = {}
        conn = get_connection()
        data = list(r.table('user').run(conn))
        close_connection(conn)
        for d in data:
            user = User(d['id'], d['name'], d['username'])
            USERS[user.id] = user
    return USERS[user_id]

def get_group(group_id):
    global GROUPS
    if GROUPS is None:
        GROUPS = {}
        conn = get_connection()
        data = list(r.table('group').run(conn))
        close_connection(conn)
        for d in data:
            group = Group(d['id'], d['name'], d['username'])
            GROUPS[group.id] = group
    return GROUPS[group_id]

def get_type(type_id):
    return TYPES.get(type_id)

def get_status(data_row, user_id):
    if str(user_id) in data_row:
        return STATUSES.get(data_row[str(user_id)])
    else:
        return 'UNREAD'

def get_user_data_dump(json_data, user):
    user_data_dumps = []
    for data_row in json_data:
        type = get_type(data_row['type_id'])
        owner = get_user(data_row['owner_id'])
        group = get_group(data_row['group_id'])
        status = get_status(data_row, user.id)
        user_data_dump = UserDataDump(data_row['id'], user, type, owner, group, data_row['data'], status)
        user_data_dumps.append(user_data_dump)
    user_data_dumps.sort(key = lambda obj:(obj.status, obj.id))
    return jsonpickle.encode(user_data_dumps, unpicklable=False)

def get_user_id():
    return 2

if __name__ == '__main__':
    app.run(host='0.0.0.0')


