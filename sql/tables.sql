use resturant;
create table if not exists history_record
(
	id int not null auto_increment,
	primary key (id),
	created_dated datetime not null default CURRENT_TIMESTAMP,
	last_modified_date datetime not null default CURRENT_TIMESTAMP,
	created_by int not null,
	foreign key (user_id) references employee(id),
	last_modified_by int not null,
	foreign key (user_id) references employee(id)
);
create table if not exists employee
(
	id int not null auto_increment,
	primary key (id),
	first_name varchar(20) default null CHARACTER SET utf8 COLLATE utf8_general_ci,
	last_name varchar(20) default null CHARACTER SET utf8 COLLATE utf8_general_ci,
	username varchar(30) not null unique,
	email varchar(70) not null unique,
	role varchar(20) not null default 'employee',
	token varchar(100) not null,
	salt varchar(100) not null,
	keyBytes int not null,
	iteration int not null,
	history_id int not null,
	foreign key (history_id) references history_record(id)	
);

create table if not exists user_login
(
	id int not null auto_increment,
	primary key (id),
	login_date datetime not null default CURRENT_TIMESTAMP,
	user_id int not null,
	foreign key (user_id) references employee(id)
);

create table if not exists files
(
	id int not null auto_increment,
	primary key (id),
	name varchar(80) not null CHARACTER SET utf8 COLLATE utf8_general_ci,
	data blob NOT NULL,
	mime varchar(255) NOT NULL, /*stores the mime type of the file*/
	history_id int not null,
	foreign key (history_id) references history_record(id)	
);
/*
	TODO : need to rethink; ask jocy
*/
create table if not exists materials
(
	id int not null auto_increment,
	primary key (id),
	name varchar(80) not null CHARACTER SET utf8 COLLATE utf8_general_ci,
	quantity int not null default 0,
	cost float(8,2) not null default 0,
	total float(8,2) not null default 0,	
	history_id int not null,
	foreign key (history_id) references history_record(id)	
);

create table if not exists products
(
	id int not null auto_increment,
	primary key (id),
	name varchar(80) not null CHARACTER SET utf8 COLLATE utf8_general_ci,
	price float(8,2) not null default 0,
	description text CHARACTER SET utf8 COLLATE utf8_general_ci,
	image_id int default null,
	foreign key (image_id) references files(id),
	history_id int not null,
	foreign key (history_id) references history_record(id)	
);
/*
	Many to Many relationship product_book vs materials
	TODO : need pk
*/
create table if not exists composite_table
(	
	product_id int not null,
	foreign key (product_id) references products(id),
	quantity int not null default 0,
	material_id int not null,
	foreign key (material_id) references materials(id)	
);

create table if not exists opportunities
(
	id int not null auto_increment,
	primary key (id)
);
