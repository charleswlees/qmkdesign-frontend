FROM public.ecr.aws/docker/library/node:18-alpine

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

ENV AWS_LWA_INVOKE_MODE=response_stream

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5173

CMD [ "npm", "run", "preview"]
