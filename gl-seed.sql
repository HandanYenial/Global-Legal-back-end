INSERT INTO employees(username, password, first_name,last_name,email,is_admin)
VALUES('paralegal',
       '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
       'Paralegal',
       'User'
       'paralegal@global.com',
       FALSE),
       ('lawyer',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q'
        'Lawyer',
        'Admin',
        'lawyer@global.com',
        TRUE);
        

INSERT INTO departments(handle,name,num_employees,description)
VALUES('criminal' , 'Criminal Attorneys' , 10 , 'Criminal lawyers (also known as criminal defense lawyers) defend individuals
 who have been accused of committing a crime. They conduct research, analyze cases, and present their findings
 in court in an effort to gain the defendants freedom or negotiate a plea bargain or settlement.')
 ('family','Family Attorneys' , 9 , 'Family lawyers (also known as family law attorneys) help families resolve legal issues
  such as divorce, child custody, and adoption. They also help families resolve issues that arise when a family
  member dies without a will.')
 ('immigration','Immigration Attorneys' , 10 , 'Immigration attorneys handle legal matters that pertain to immigration matters.
 Immigration attorneys interpret and provide advice on migration, citizenship and business immigration issues, 
 political asylum, and on the processes through which people may secure travel, work or student visas.')
 ('business','Business Attorneys' , 15 , 'Business Lawyers are who focus on providing legal advice to business owners on issues that
  affect businesses, such as taxation, business transactions, and intellectual property rights. The Business Lawyer 
  may also be known as a Corporate Attorney, Corporate Lawyer, or Commercial Lawyer.')

INSERT INTO cases(title,description,location,department_handle)
VALUES('Criminal Case 1' , 'This is a criminal case' , 'New York' , 'criminal')
      ('Immigration Case 1', 'This is an immiration case' , 'Albany' ,'immigration' )
      ('Immigration Case 2' , 'This is another immigartion case' , 'New York', 'immigration')
      ('Business Case 1', 'Here is the business case' , 'Buffolo' , 'business')
      ('Business Case 2' , 'Another business case' , 'Syracuse' , 'business')
      ('Family Case 1' , 'This is a family case' , 'Rochester' , 'family')
      ('Family Case 2' , 'This is another family case' , 'Newyork' , 'family')
      ('Criminal Case 2' , 'This is a criminal case' , 'Albany' , 'criminal')
      ('Criminal Case 3' , 'This is a criminal case' , 'Utica' , 'criminal')
      
