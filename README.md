TEST Symfony 4 REST API application
====================================

## API Methods

GET /api/users - get all contacts

GET /api/users/{name} - Get single contact by name

POST /api/users - Insert contact (accepts an json encoded object. for example, ```{"name":"John","phones":[{"number":"123456789" },{"number":"987654321"}]}```)

PUT /api/users/{id} - Update contact by id (accepts an json encoded object. for example, ```{"name":"John Edited","phones":[{"id":1,"number":"99999999" },{"number":"77777"}]}``` if the phone object contains an id - the phone number of this id will be updated, otherwise - added)

DELETE /api/users/{id} - Delete contact by id

## installation

1. $ git clone https://github.com/lloonnyyaa/phone-book.git
2. $ composer update
3. rename .env.dist to .env and set up your credentials to DB (DATABASE_URL=mysql://db_user:db_password@127.0.0.1:3306/db_name)
4. $ php bin/console doctrine:schema:create

## testing
You can test the application by url of the domain on which the application is deployed or via postman. 
Temporally testing link: https://cloud.php-dev.pp.ua/
