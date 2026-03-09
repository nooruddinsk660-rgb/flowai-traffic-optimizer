from routing import AMBULANCE_ROUTES

if __name__ == "__main__":
    print(f"Total routes loaded: {len(AMBULANCE_ROUTES)}")
    for i, (route_key, legs) in enumerate(AMBULANCE_ROUTES.items(), 1):
        print(f"\nRoute {i}: {route_key}")
        for leg in legs:
            print(f"  -> {leg}")
    print("\nAMBULANCE_ROUTES imported successfully!")
