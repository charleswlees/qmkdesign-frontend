FROM hashicorp/terraform:latest

WORKDIR /workspace

# Copy terraform files
COPY terraform/*.tf  ./
COPY dist/ ./dist/

# Clean any existing state
RUN rm -f terraform.tfstate* .terraform.lock.hcl;
RUN rm -rf .terraform/;
