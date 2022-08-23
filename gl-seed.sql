INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('user',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Lawyer',
        'user',
        'user@legal.com',
        FALSE),
       ('admin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Manager',
        'Admin!',
        'admin@legal.com',
        TRUE);

INSERT INTO categories(handle,name,num_employees,description)
VALUES('criminal','Criminal Attorneys',10,'Criminal lawyers (also known as criminal defense lawyers) defend individuals
 who have been accused of committing a crime. They conduct research, analyze lawsuits, and present their findings
 in court in an effort to gain the defendants freedom or negotiate a plea bargain or settlement.'),
 ('family','Family Attorneys',9,'Family lawyers (also known as family law attorneys) help families resolve legal issues
  such as divorce, child custody, and adoption. They also help families resolve issues that arise when a family
  member dies without a will.'),
 ('immigration','Immigration Attorneys',10,'Immigration attorneys handle legal matters that pertain to immigration matters.
 Immigration attorneys interpret and provide advice on migration, citizenship and business immigration issues, 
 political asylum, and on the processes through which people may secure travel, work or student visas.'),
 ('business','Business Attorneys',15,'Business Lawyers are who focus on providing legal advice to business owners on issues that
  affect businesses, such as taxation, business transactions, and intellectual property rights. The Business Lawyer 
  may also be known as a Corporate Attorney, Corporate Lawyer, or Commercial Lawyer.');

INSERT INTO lawsuits(id,title,description,comment, location,category_handle,created_at,updated_at)
VALUES(1, 'Criminal lawsuit 1','This is a criminal lawsuit','Open','New York','criminal','2019-01-01 00:00:00','2019-01-01 00:00:00'),
      (2, 'Immigration lawsuit 1','This is an immiration lawsuit','Open','Albany','immigration', '2019-01-01 00:00:00','2019-01-01 00:00:00'),
      (3, 'Immigration lawsuit 2','This is another immigartion lawsuit','Pending','New York','immigration', '2019-01-01 00:00:00','2019-01-01 00:00:00'),
      (4, 'Business lawsuit 1','Here is the business lawsuit','Closed','Buffolo','business', '2019-01-01 00:00:00','2019-01-01 00:00:00'),
      (5, 'Business lawsuit 2','Another business lawsuit','Closed','Syracuse','business','2019-01-01 00:00:00','2019-01-01 00:00:00'),
      (6, 'Family lawsuit 1','This is a family lawsuit','Pending','Rochester','family', '2019-01-01 00:00:00','2019-01-01 00:00:00'),
      (7, 'Family lawsuit 2','This is another family lawsuit','See Department Manager','Newyork','family', '2019-01-01 00:00:00','2019-01-01 00:00:00'),
      (8, 'Criminal lawsuit 2','This is a criminal lawsuit','Open','Albany','criminal', '2019-01-01 00:00:00','2019-01-01 00:00:00'),
      (9, 'Criminal lawsuit 3','This is a criminal lawsuit','Open','Utica','criminal','2019-01-01 00:00:00','2019-01-01 00:00:00');
      
INSERT INTO assignments(username, lawsuit_id)
VALUES('user',1),
      ('user',2),
      ('user',3);
     