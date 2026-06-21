from google.cloud import aiplatform

print("Initializing AI Platform...")
aiplatform.init(project="hari-tva", location="us-central1")

print("Loading existing uploaded Model...")
model = aiplatform.Model("projects/214962544036/locations/us-central1/models/7254631046379995136")

print("Creating Endpoint...")
endpoint = aiplatform.Endpoint.create(
    display_name="qwen3-8b-gemini-2_5-flash-distill-gguf-mg-one-click-deploy"
)

print("Deploying Model to Endpoint (this can take 5-10 minutes to provision VMs)...")
endpoint.deploy(
    model=model,
    machine_type="g2-standard-8",
    accelerator_type="NVIDIA_L4",
    accelerator_count=1,
    min_replica_count=1,
    max_replica_count=1,
    sync=True
)

print(f"DEPLOYMENT SUCCESSFUL! Endpoint Resource Name: {endpoint.resource_name}")
print(f"Endpoint ID: {endpoint.name}")
