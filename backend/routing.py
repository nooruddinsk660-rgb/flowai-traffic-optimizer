import networkx as nx
from geopy.distance import geodesic
import matplotlib.pyplot as plt

INTERSECTION_COORDS = {
    "CP_01": (28.6315, 77.2167),
    "AIIMS_01": (28.5672, 77.2100),
    "INA_01": (28.5754, 77.2090),
    "SAK_01": (28.5244, 77.2066),
    "NEHRU_01": (28.5492, 77.2509),
    "KALK_01": (28.5357, 77.2565),
    "LODHI_01": (28.5908, 77.2266),
    "ROHINI_01": (28.7041, 77.1025)
}

EDGES = [
    ("CP_01", "INA_01"), ("CP_01", "LODHI_01"), ("CP_01", "ROHINI_01"),
    ("AIIMS_01", "INA_01"), ("AIIMS_01", "SAK_01"),
    ("INA_01", "CP_01"), ("INA_01", "AIIMS_01"), ("INA_01", "SAK_01"),
    ("SAK_01", "INA_01"), ("SAK_01", "AIIMS_01"),
    ("NEHRU_01", "KALK_01"), ("NEHRU_01", "LODHI_01"),
    ("KALK_01", "NEHRU_01"), ("KALK_01", "SAK_01"),
    ("LODHI_01", "CP_01"), ("LODHI_01", "NEHRU_01"), ("LODHI_01", "INA_01"),
    ("ROHINI_01", "CP_01")
]

def build_delhi_graph():
    G = nx.DiGraph()
    for node, coords in INTERSECTION_COORDS.items():
        G.add_node(node, pos=(coords[1], coords[0]))
        
    for u, v in EDGES:
        dist_km = geodesic(INTERSECTION_COORDS[u], INTERSECTION_COORDS[v]).km
        travel_time_s = int(dist_km * (3600 / 30))
        G.add_edge(u, v, weight=travel_time_s, distance_km=dist_km)
        
    return G

G_DELHI = build_delhi_graph()

def get_compass_entry_direction(source_coords, target_coords):
    dlat = target_coords[0] - source_coords[0]
    dlng = target_coords[1] - source_coords[1]
    if abs(dlat) > abs(dlng):
        return "north" if dlat < 0 else "south"
    else:
        return "east" if dlng < 0 else "west"

def generate_ambulance_routes(G):
    routes_to_generate = [
        ("CP_01", "AIIMS_01"),
        ("NEHRU_01", "AIIMS_01"),
        ("ROHINI_01", "AIIMS_01"),
        ("SAK_01", "AIIMS_01"),
        ("LODHI_01", "AIIMS_01"),
        ("KALK_01", "AIIMS_01"),
        ("CP_01", "SAK_01")
    ]
    
    routes_dict = {}
    for start, end in routes_to_generate:
        path = nx.dijkstra_path(G, start, end, weight="weight")
        key = f"{start}_{end}"
        
        legs = []
        for i in range(len(path)):
            current_node = path[i]
            if i == 0:
                if len(path) > 1:
                    direction = get_compass_entry_direction(INTERSECTION_COORDS[path[0]], INTERSECTION_COORDS[path[1]])
                else:
                    direction = "start"
                travel_s = G[current_node][path[i+1]]["weight"]
                legs.append({"id": current_node, "direction": direction, "travel_s": travel_s})
            elif i == len(path) - 1:
                legs.append({"id": current_node, "direction": "arrived", "travel_s": 0})
            else:
                prev_node = path[i-1]
                next_node = path[i+1]
                direction = get_compass_entry_direction(INTERSECTION_COORDS[prev_node], INTERSECTION_COORDS[current_node])
                travel_s = G[current_node][next_node]["weight"]
                legs.append({"id": current_node, "direction": direction, "travel_s": travel_s})
        
        routes_dict[key] = legs
        
    return routes_dict

AMBULANCE_ROUTES = generate_ambulance_routes(G_DELHI)

def visualize_graph(G):
    plt.figure(figsize=(10, 8))
    pos = nx.get_node_attributes(G, 'pos')
    
    node_colors = []
    for node in G.nodes():
        if "ROHINI" in node:
            node_colors.append("lightblue")
        elif "CP" in node or "LODHI" in node or "INA" in node:
            node_colors.append("lightgreen")
        else:
            node_colors.append("salmon")
            
    nx.draw(G, pos, with_labels=True, node_color=node_colors, node_size=2000, font_size=10, font_weight="bold", arrows=True)
    
    edge_labels = {(u, v): f"{d['weight']}s" for u, v, d in G.edges(data=True)}
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=8)
    
    plt.title("Delhi Intersection Graph - FlowAI")
    plt.savefig("delhi_graph.png")
    print("Graph visualization saved as delhi_graph.png")

if __name__ == "__main__":
    print(f"Graph nodes: {G_DELHI.number_of_nodes()}")
    print(f"Graph edges: {G_DELHI.number_of_edges()}")
    
    cp_aiims_path = nx.dijkstra_path(G_DELHI, "CP_01", "AIIMS_01", weight="weight")
    print(f"Shortest path CP_01 -> AIIMS_01: {cp_aiims_path}")
    
    visualize_graph(G_DELHI)
