# API Node.js com Infraestrutura AWS

Este projeto consiste em uma API Node.js com banco de dados PostgreSQL, totalmente implantável na AWS usando Infraestrutura como Código (Terraform).

## 🏗️ Arquitetura

A aplicação é implantada na AWS com os seguintes componentes:

- **ECS (Elastic Container Service)** com Fargate para executar a aplicação
- **RDS (Relational Database Service)** para banco de dados PostgreSQL
- **ECR (Elastic Container Registry)** para armazenar imagens Docker
- **VPC (Virtual Private Cloud)** com subnets públicas e privadas
- **Security Groups** para controle de acesso à rede
- **IAM Roles** para permissões de serviços

URL da aplicação: http://brain-api-alb-1624356598.us-east-1.elb.amazonaws.com

## 🛠️ Pré-requisitos

- AWS CLI configurado com credenciais apropriadas
- Terraform instalado (v1.0.0 ou mais recente)
- Docker instalado
- Node.js instalado (para desenvolvimento local)
- Git

## 🚀 Começando

### Desenvolvimento Local

1. Clone o repositório:

```bash
git clone git@github.com:douglastmpadilha/brain.git
cd brain
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env`:

```env
DATABASE_URL=postgresql://brain:brain@localhost:5432/brain
```

4. Execute a aplicação:

```bash
npm run dev
```

## Desenvolvimento local com docker-compose

1. Execute o comando:

```bash
docker-compose up
```

### Implantação da Infraestrutura

1. Navegue até o diretório terraform:

```bash
cd terraform
```

2. Inicialize o Terraform:

```bash
terraform init
```

3. Implante a infraestrutura:

```bash
terraform plan
terraform apply
```

### Implantação da Aplicação

1. Construa a imagem Docker:

```bash
docker build -t brain-app .
```

2. Envie para o ECR:

```bash
# Login no ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# Tag da imagem
docker tag brain-app:latest $(terraform output -raw ecr_repository_url):latest

# Push da imagem
docker push $(terraform output -raw ecr_repository_url):latest
```


## 📁 Estrutura do Projeto

```
.
├── src/
│   ├── controllers/
│   │   └── produtor.controller.ts
│   ├── models/
│   │   └── produtor.model.ts
│   ├── routes/
│   │   └── produtor.route.ts
│   ├── utils/
│   │   └── errors.ts
│   │   └── types.ts
│   ├── swagger.ts
│   └── app.ts
├── terraform/
│   ├── main.tf
│   ├── rds.tf
│   ├── ecs.tf
│   ├── ecr.tf
│   ├── iam.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars
├── Dockerfile
├── package.json
└── README.md
```

## 📝 Endpoints da API

### Rotas do Produtor
- `GET /produtor/:id` - Obtém um produtor específico

```bash
curl -X GET http://localhost:3001/produtor/1
```


- `GET /produtor` - Lista todos os produtores

```bash
curl -X GET http://localhost:3001/produtor
```

- `POST /produtor` - Cria novo produtor

```bash
curl -X POST http://localhost:3001/produtor -H "Content-Type: application/json" -d '{"nome": "Novo Produtor", "cpfCnpj": "1234567890", "fazenda": "Fazenda Nova", "cidade": "São Paulo", "estado": "SP", "areaTotal": 100, "areaAgricola": 50, "areaVegetacao": 50, "culturas": ["Café", "Cana de Açúcar"]}'
```

- `PUT /produtor/:id` - Atualiza um produtor

```bash
curl -X PUT http://localhost:3001/produtor/1 -H "Content-Type: application/json" -d '{"nome": "Produtor Atualizado", "cpfCnpj": "0987654321", "fazenda": "Fazenda Atualizada", "cidade": "Rio de Janeiro", "estado": "RJ", "areaTotal": 150, "areaAgricola": 75, "areaVegetacao": 75, "culturas": ["Café", "Cana de Açúcar"]}'
```

## 🧪 Testes

```bash
npm run test
```

## 📚 Documentação

Documentação da API pode ser acessada em:
- Documentação: `/docs`
- Swagger UI: `/swagger`

## 👥 Autores

- Douglas Padilha
