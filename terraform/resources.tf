resource "aws_ecr_repository" "qmkdesign-frontend" {
  provider = aws.p1
  name = "qmkdesign-frontend"
}

resource "aws_ecr_lifecycle_policy" "cleanup" {
  provider   = aws.p1
  repository = aws_ecr_repository.qmkdesign-frontend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Only keep 2 images in ECR"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 2
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_lambda_function" "frontend_lambda" {
  provider      = aws.p1
  function_name = "frontend_api"
  role          = aws_iam_role.lambda_role.arn  
  
  package_type = "Image"
  image_uri    = "${aws_ecr_repository.qmkdesign-frontend.repository_url}:latest"  
  
  timeout     = 30
  memory_size = 128
  
  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy.lambda_policy
  ]
}


resource "aws_lambda_function_url" "api_url" {
  provider           = aws.p1
  function_name      = aws_lambda_function.frontend_lambda.function_name
  authorization_type = "NONE"  
}

output "function_url" {
  value = aws_lambda_function_url.api_url.function_url
}
