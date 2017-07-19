# https://github.com/hharnisc/python-meteor
import time

from MeteorClient import MeteorClient

client = MeteorClient('ws://127.0.0.1:3000/websocket')


def subscribed(subscription):
    print('* SUBSCRIBED {}'.format(subscription))

def unsubscribed(subscription):
    print('* UNSUBSCRIBED {}'.format(subscription))


def added(collection, id, fields):
    print('* ADDED {} {}'.format(collection, id))
    for key, value in fields.items():
        print('  - FIELD {} {}'.format(key, value))

    # query the data each time something has been added to
    # a collection to see the data `grow`
    # all_lists = client.find('lists', selector={})
    # print('Lists: {}'.format(all_lists))
    # print('Num lists: {}'.format(len(all_lists)))

    # if collection == 'list' you could subscribe to the list here
    # with something like
    # client.subscribe('todos', id)
    # all_todos = client.find('todos', selector={})
    # print 'Todos: {}'.format(all_todos)

    all_lists = client.find('tasks', selector={})
    print('Tasks: {}'.format(all_lists))
    print('Num lists: {}'.format(len(all_lists)))

def changed():
    print('* changed')
    all_lists = client.find('tasks', selector={})
    print('Tasks: {}'.format(all_lists))
    print('Num lists: {}'.format(len(all_lists)))
    print('end changed')

def on_logged_in(data):
    print('* LOGGIN IN')
    # conf.set('ddp', 'token', data['token'])
    # conf.update()

def connected():
    print('* CONNECTED')
    all_lists = client.find('tasks', selector={})
    print('Tasks: {}'.format(all_lists))
    print('Num lists: {}'.format(len(all_lists)))
    print('end connected, try login')
    client.login('test', "1234")
    # https://github.com/hharnisc/python-meteor/pull/21

def subscription_callback(error):
    if error:
        print(error)

client.on('changed', changed)
client.on('subscribed', subscribed)
client.on('unsubscribed', unsubscribed)
client.on('added', added)
client.on('connected', connected)
client.on('logged_in', on_logged_in)

client.connect()
# client.subscribe('publicLists')

client.subscribe('tasks')

# (sort of) hacky way to keep the client alive
# ctrl + c to kill the script
while True:
    try:
        time.sleep(1)
    except KeyboardInterrupt:
        break

# client.unsubscribe('publicLists')
