#!/bin/bash

npx prisma migrate dev

exec "$@"