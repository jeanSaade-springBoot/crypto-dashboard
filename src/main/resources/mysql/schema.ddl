
INSERT INTO `data`.`users`
(`id`,
`country`,
`created_on`,
`first_name`,
`password`,
`sur_name`,
`username`,
`is_first_login`,
`status`)
VALUES
(1,
'Lebanon',
now(),
'Admin',
'$2a$12$GFOd7M2iYWcgvUIY7sRki.Ytz.aG3qC/2u2MyxWA72l8T.jMMt0MO',
'',
'Admin',
false,
'ACTIVE');
UPDATE `data`.`users` SET `tac_accepted` = '1' WHERE (`id` = '1');

INSERT INTO role( id, name )
	VALUES ('1', 'ROLE_SUPER_ADMIN');
	
INSERT INTO role( id, name )
	VALUES ('2', 'ROLE_ADMIN');
	
INSERT INTO role( id, name )
	VALUES ('3', 'ROLE_USER');
	
INSERT INTO users_roles(
	user_id, role_id)
	VALUES (1, 1);
	
INSERT INTO `data`.`membership_duration` (`id`, `value`,`description`) VALUES ('1','1', '1 Month');
INSERT INTO `data`.`membership_duration` (`id`,`value`,`description`) VALUES ('2','4', '4 Months');
INSERT INTO `data`.`membership_duration` (`id`,`value`,`description`) VALUES ('3','12', '1 Year');
INSERT INTO `data`.`membership_duration` (`id`, `value`,`description`) VALUES ('4','100', 'Unlimited');

INSERT INTO `data`.`user_membership` (`id`, `created_on`, `is_active`, `md_id`, `user_id`)
 VALUES ('1', now(), true, '1', '1');