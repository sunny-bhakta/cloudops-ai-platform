aws_region   = "ap-south-1"
environment  = "dev"
project_name = "cloudops-ai-platform"

vpc_cidr = "10.0.0.0/16"

availability_zones = [
  "ap-south-1a",
  "ap-south-1b"
]

container_image_tag = "REPLACE_WITH_GIT_SHA"