from ultralytics import YOLO

def main():
    model = YOLO('yolov8n.pt')
    model.train(
        data=r'C:\Users\Sk Nooruddin\FLOWAI\models\ambulance_dataset\indian-ambulance-detector.v1i.yolov8\data.yaml',
        epochs=40,
        batch=4,
        device='cpu',
        project=r'C:\Users\Sk Nooruddin\FLOWAI\models',
        name='ambulance_v1_training'
    )

if __name__ == '__main__':
    main()
