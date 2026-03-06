from signal_brain import calculate_green_time

def run_tests():
    print("Running Unit Tests for calculate_green_time()...")
    
    # At density=1.0 -> 60s
    assert calculate_green_time(1.0, 0) == 60, "Failed: density=1.0 should be 60s"
    
    # At density=0.8, aqi_penalty=10 -> 44s
    assert calculate_green_time(0.8, 10) == 44, "Failed: density=0.8, aqi=10 should be 44s"
    
    # Testing min bounds: clamp at 20 (e.g., negative density or high AQI penalty)
    assert calculate_green_time(0.0, 30) == 20, "Failed: clamp at min 20s"
    assert calculate_green_time(0.0, 0) == 30, "Failed: density=0 is 30s based on formula"
    
    # Testing max bounds: clamp at 90 (e.g., density=2.0 somehow, or negative penalty)
    assert calculate_green_time(3.0, 0) == 90, "Failed: clamp at max 90s"
    
    print("All tests passed successfully!")

if __name__ == "__main__":
    run_tests()
