# Документация по API бэкенда библиотеки книг

## Обзор

Это API бэкенда для приложения Библиотека книг. Оно предоставляет эндпоинты для управления книгами, аутентификации пользователей, отзывами и избранными книгами. API построено на Express.js и использует LowDB в качестве легкой JSON-базы данных.

## Содержание

- [Установка](#установка)
- [Аутентификация](#аутентификация)
- [Модели данных](#модели-данных)
- [API Эндпоинты](#api-эндпоинты)
  - [Эндпоинты аутентификации](#эндпоинты-аутентификации)
  - [Эндпоинты книг](#эндпоинты-книг)
  - [Эндпоинты отзывов](#эндпоинты-отзывов)
- [Обработка ошибок](#обработка-ошибок)

## Установка

```bash
# Установка зависимостей
npm install

# Запуск сервера в режиме разработки с nodemon
npm run dev

# Запуск сервера в производственном режиме
npm start
```

По умолчанию сервер запускается на порту 3000.

## Аутентификация

Это API использует JWT (JSON Web Tokens) для аутентификации. Токен должен быть включен в заголовок Authorization для защищенных маршрутов.

Пример:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Модели данных

### Схема пользователя

```javascript
{
  id: Number,
  username: String,
  password: String, // Хэшированный
  email: String,
  firstName: String, // Опционально
  lastName: String,  // Опционально
  role: String       // 'user' или 'admin'
}
```

### Схема книги

```javascript
{
  id: Number,
  title: String,
  author: String,
  year: Number,
  genre: String,
  description: String,
  coverUrl: String,
  userId: Number,     // Ссылка на пользователя, добавившего книгу
  // Виртуальные поля, добавляемые в ответ:
  ownerName: String,
  ownerFullName: String,
  isFavorite: Boolean // Присутствует только при аутентификации
}
```

### Схема отзыва

```javascript
{
  id: Number,
  bookId: Number,
  userId: Number,
  text: String,
  rating: Number,     // 1-5
  date: String,       // ISO строка даты
  // Виртуальные поля, добавляемые в ответ:
  username: String
}
```

### Схема избранного

```javascript
{
  id: Number,
  userId: Number,
  bookId: Number
}
```

## API Эндпоинты

### Эндпоинты аутентификации

#### Регистрация нового пользователя

```
POST /api/auth/register
```

Тело запроса:
```json
{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Иванов"
}
```

Ответ (201 Created):
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "firstName": "Иван",
    "lastName": "Иванов"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Вход

```
POST /api/auth/login
```

Тело запроса:
```json
{
  "username": "user123",
  "password": "password123"
}
```

Ответ (200 OK):
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "firstName": "Иван",
    "lastName": "Иванов",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Эндпоинты книг

#### Получение всех книг

```
GET /api/books
```

Ответ (200 OK):
```json
[
  {
    "id": 1,
    "title": "Великий Гэтсби",
    "author": "Ф. Скотт Фицджеральд",
    "year": 1925,
    "genre": "Художественная литература",
    "description": "Роман об американской мечте...",
    "coverUrl": "/uploads/covers/gatsby.jpg",
    "userId": 1,
    "ownerName": "user123",
    "ownerFullName": "Иван Иванов",
    "isFavorite": false
  },
  // Другие книги...
]
```

#### Получение книги по ID

```
GET /api/books/:id
```

Ответ (200 OK):
```json
{
  "id": 1,
  "title": "Великий Гэтсби",
  "author": "Ф. Скотт Фицджеральд",
  "year": 1925,
  "genre": "Художественная литература",
  "description": "Роман об американской мечте...",
  "coverUrl": "/uploads/covers/gatsby.jpg",
  "userId": 1,
  "ownerName": "user123",
  "ownerFullName": "Иван Иванов",
  "isFavorite": false
}
```

#### Добавление новой книги (требуется аутентификация)

```
POST /api/books
```

Тело запроса:
```json
{
  "title": "1984",
  "author": "Джордж Оруэлл",
  "year": 1949,
  "genre": "Антиутопия",
  "description": "Роман-антиутопия о тоталитарном обществе...",
  "coverUrl": "/uploads/covers/1984.jpg"
}
```

Ответ (201 Created):
```json
{
  "id": 2,
  "title": "1984",
  "author": "Джордж Оруэлл",
  "year": 1949,
  "genre": "Антиутопия",
  "description": "Роман-антиутопия о тоталитарном обществе...",
  "coverUrl": "/uploads/covers/1984.jpg",
  "userId": 1,
  "ownerName": "user123",
  "ownerFullName": "Иван Иванов"
}
```

#### Обновление книги (требуется аутентификация)

```
PUT /api/books/:id
```

Тело запроса:
```json
{
  "description": "Обновленное описание..."
}
```

Ответ (200 OK):
```json
{
  "id": 1,
  "title": "Великий Гэтсби",
  "author": "Ф. Скотт Фицджеральд",
  "year": 1925,
  "genre": "Художественная литература",
  "description": "Обновленное описание...",
  "coverUrl": "/uploads/covers/gatsby.jpg",
  "userId": 1,
  "ownerName": "user123",
  "ownerFullName": "Иван Иванов"
}
```

#### Удаление книги (требуется аутентификация)

```
DELETE /api/books/:id
```

Ответ (200 OK):
```json
{
  "message": "Книга успешно удалена"
}
```

#### Получение избранных книг пользователя (требуется аутентификация)

```
GET /api/books/favorites
```

Ответ (200 OK):
```json
[
  {
    "id": 1,
    "title": "Великий Гэтсби",
    "author": "Ф. Скотт Фицджеральд",
    "year": 1925,
    "genre": "Художественная литература",
    "description": "Роман об американской мечте...",
    "coverUrl": "/uploads/covers/gatsby.jpg",
    "userId": 1,
    "ownerName": "user123",
    "ownerFullName": "Иван Иванов",
    "isFavorite": true
  },
  // Другие избранные книги...
]
```

#### Переключение статуса избранного (требуется аутентификация)

```
POST /api/books/:id/favorite
```

Ответ (200 OK) при добавлении в избранное:
```json
{
  "isFavorite": true,
  "message": "Книга добавлена в избранное"
}
```

Ответ (200 OK) при удалении из избранного:
```json
{
  "isFavorite": false,
  "message": "Книга удалена из избранного"
}
```

### Эндпоинты отзывов

#### Получение всех отзывов для книги

```
GET /api/reviews/book/:id
```

Ответ (200 OK):
```json
[
  {
    "id": 1,
    "bookId": 1,
    "userId": 2,
    "text": "Отличная книга!",
    "rating": 5,
    "date": "2023-05-20T12:30:45.000Z",
    "username": "alice123"
  },
  // Другие отзывы...
]
```

#### Добавление нового отзыва (требуется аутентификация)

```
POST /api/reviews
```

Тело запроса:
```json
{
  "bookId": 1,
  "text": "Одна из моих любимых книг!",
  "rating": 5
}
```

Ответ (201 Created):
```json
{
  "id": 2,
  "bookId": 1,
  "userId": 1,
  "text": "Одна из моих любимых книг!",
  "rating": 5,
  "date": "2023-06-15T09:12:34.000Z",
  "username": "user123"
}
```

#### Обновление отзыва (требуется аутентификация)

```
PUT /api/reviews/:id
```

Тело запроса:
```json
{
  "text": "Обновленный текст отзыва",
  "rating": 4
}
```

Ответ (200 OK):
```json
{
  "id": 2,
  "bookId": 1,
  "userId": 1,
  "text": "Обновленный текст отзыва",
  "rating": 4,
  "date": "2023-06-15T10:45:12.000Z",
  "username": "user123"
}
```

#### Удаление отзыва (требуется аутентификация)

```
DELETE /api/reviews/:id
```

Ответ (200 OK):
```json
{
  "message": "Отзыв успешно удален"
}
```

## Обработка ошибок

API возвращает соответствующие HTTP-коды состояния вместе с сообщениями об ошибках:

### Распространенные ответы с ошибками

- **400 Bad Request**: Отсутствуют или некорректны параметры
- **401 Unauthorized**: Отсутствует токен аутентификации
- **403 Forbidden**: Токен действителен, но недостаточно прав
- **404 Not Found**: Ресурс не найден
- **500 Internal Server Error**: Ошибка на стороне сервера

Пример ответа с ошибкой:
```json
{
  "error": "Книга не найдена"
}
```

## Правила аутентификации

1. Для создания книги требуется аутентификация
2. Пользователи могут обновлять/удалять только свои книги (если у них нет роли администратора)
3. Пользователи не могут удалять книги с отзывами
4. Для создания отзыва требуется аутентификация
5. Пользователи могут обновлять/удалять только свои отзывы

## Примеры

### Пример: Полный процесс управления книгой

1. Регистрация нового пользователя:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123","email":"alice@example.com"}'
```

2. Вход для получения токена:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

3. Добавление новой книги с использованием токена:

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -d '{"title":"Убить пересмешника","author":"Харпер Ли","year":1960,"genre":"Художественная литература","description":"Роман о расовой несправедливости и моральном росте..."}'
```

4. Получение всех книг (аутентификация не требуется):

```bash
curl -X GET http://localhost:3000/api/books
```

5. Добавление книги в избранное:

```bash
curl -X POST http://localhost:3000/api/books/1/favorite \
  -H "Authorization: Bearer ВАШ_ТОКЕН"
```

6. Добавление отзыва для книги:

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -d '{"bookId":1,"text":"Отличная классика!","rating":5}'
```

7. Обновление описания книги:

```bash
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -d '{"description":"Обновленное описание о расовой несправедливости..."}'
``` 