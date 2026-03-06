import asyncio
import websockets
import time

async def client_worker(client_id):
    uri = "ws://localhost:8000/ws"
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Client {client_id} connected.")
            # Keep reading for 10 seconds
            start_time = time.time()
            msg_count = 0
            while time.time() - start_time < 10:
                await websocket.recv()
                msg_count += 1
            print(f"Client {client_id} received {msg_count} messages.")
    except Exception as e:
        print(f"Client {client_id} error: {e}")

async def run_stress_test():
    print("Starting stress test: 10 concurrent WebSocket connections")
    tasks = [asyncio.create_task(client_worker(i)) for i in range(10)]
    await asyncio.gather(*tasks)
    print("Stress test completed.")

if __name__ == "__main__":
    asyncio.run(run_stress_test())
