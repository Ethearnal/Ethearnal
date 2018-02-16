#!/usr/bin/env python
import argparse
import asyncio
import datetime
import random
import websockets
import sys

parser = argparse.ArgumentParser(description='Websockets')
parser.add_argument('-ip', '--ws_ip',
                    default='127.0.0.1',
                    help='E,g 127.0.0.1',
                    required=True,
                    type=str)
parser.add_argument('-port', '--ws_port',
                    default='6789',
                    help='E,g 6789',
                    required=True,
                    type=str)
args = parser.parse_args()
ws_ip = args.ws_ip
ws_port = args.ws_port

try:
    async def time(websocket, path):
        while True:
            now = datetime.datetime.utcnow().isoformat() + 'Z'
            await websocket.send(now)
            await asyncio.sleep(random.random() * 3)


    start_server = websockets.serve(time, ws_ip, ws_port)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
except Exception as e:
    print(str(e))
    sys.exit()
