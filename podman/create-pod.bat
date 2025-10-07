podman pod create --name=contextual ^
--publish=8080:8080 ^
--publish=50051:50051 ^
--publish=11434:11434

podman create --pod=contextual ^
--name=contextual-db ^
--env-file=./env.txt ^
--volume=contextual_weaviate_data:/var/lib/weaviate ^
cr.weaviate.io/semitechnologies/weaviate:1.32.9

podman create --pod=contextual ^
--name=contextual-ollama ^
--volume=contextual_ollama_data:/root/.ollama ^
docker.io/ollama/ollama:0.12.1