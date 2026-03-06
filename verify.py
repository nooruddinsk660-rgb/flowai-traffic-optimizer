import cv2, os

print('--- Video Verify ---')
for f in os.listdir('videos'):
    if f.endswith('.mp4'):
        cap = cv2.VideoCapture(f'videos/{f}')
        ret, frame = cap.read()
        print(f'{f} OK: {ret}')
        cap.release()
