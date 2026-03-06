import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://localhost:8000/ws"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WS!")
            response = await websocket.recv()
            data = json.loads(response)
            
            print("Received initial data:", len(data.get("intersections", [])))
            print(f"Timestamp: {data.get('timestamp')}")
            
    except Exception as e:
        print(f"Error test connecting: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
