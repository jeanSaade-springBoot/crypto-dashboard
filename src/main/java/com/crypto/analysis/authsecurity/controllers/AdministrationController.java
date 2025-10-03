package com.crypto.analysis.authsecurity.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.crypto.analysis.authsecurity.domain.MembershipDuration;
import com.crypto.analysis.authsecurity.domain.Role;
import com.crypto.analysis.authsecurity.domain.User;
import com.crypto.analysis.authsecurity.domain.UsersMembershipView;
import com.crypto.analysis.authsecurity.domain.UsersRolesView;
import com.crypto.analysis.authsecurity.dto.CreateRoleDTO;
import com.crypto.analysis.authsecurity.dto.PrivilegesRoleDTO;
import com.crypto.analysis.authsecurity.dto.RolePrivilegeDTO;
import com.crypto.analysis.authsecurity.dto.UserRoleDTO;
import com.crypto.analysis.authsecurity.dto.UserStatusMembershipDTO;
import com.crypto.analysis.authsecurity.service.MembershipDurationService;
import com.crypto.analysis.authsecurity.service.PrivilegeService;
import com.crypto.analysis.authsecurity.service.RoleService;
import com.crypto.analysis.authsecurity.service.UserRoleService;
import com.crypto.analysis.authsecurity.service.RolePrivilegeService;
import com.crypto.analysis.authsecurity.service.UserService;
import com.crypto.analysis.authsecurity.service.UsersMembershipViewService;
import com.crypto.analysis.authsecurity.service.UsersRolesViewService;

@RestController
public class AdministrationController {

	@Autowired 
	private final UserService userService;
	@Autowired
	private final UsersMembershipViewService usersMembershipViewService;
	@Autowired 
	private final MembershipDurationService membershipDurationService;
	@Autowired 
	private final PrivilegeService privilegeService;
	@Autowired
	private final RoleService roleService;
	@Autowired
	private final RolePrivilegeService rolePrivilegeService;
	@Autowired
	private final UsersRolesViewService usersRolesViewService;
	@Autowired
	private final UserRoleService userRoleService;
	public AdministrationController (UserService userService,
						   UsersMembershipViewService usersMembershipViewService,
						   MembershipDurationService membershipDurationService,
						   PrivilegeService privilegeService,
						   RoleService roleService,
						   RolePrivilegeService rolePrivilegeService,
						   UsersRolesViewService usersRolesViewService,
						   UserRoleService userRoleService)
	{
		this.userService = userService;
		this.usersMembershipViewService = usersMembershipViewService;
		this.membershipDurationService = membershipDurationService;
		this.privilegeService = privilegeService;
		this.roleService = roleService;
		this.rolePrivilegeService = rolePrivilegeService;
		this.usersRolesViewService=usersRolesViewService;
		this.userRoleService=userRoleService;
	}
	
	@GetMapping(value = "getuserbystatus/{status}")
	public ResponseEntity<List<UsersMembershipView>>  getUserByStatus(@PathVariable("status") String status) {
		return new ResponseEntity<>( usersMembershipViewService.getUsersMembershipByStatus(status), HttpStatus.OK);
	}
	@PostMapping(value = "updateuserstatusandmembership")
	public ResponseEntity<UsersMembershipView> updateUserStatusAndMember(@RequestBody UserStatusMembershipDTO userStatusMembershipDTO) {
		return new ResponseEntity<>(userService.updateUserStatusAndMember(userStatusMembershipDTO), HttpStatus.OK);
	}
	@GetMapping(value = "getmembershipduration")
	public ResponseEntity<List<MembershipDuration>> getMembershipDuration() {
		return new ResponseEntity<>( membershipDurationService.findAll(), HttpStatus.OK);
	}
	@GetMapping(value = "getprivilegebyrole/{roleId}")
	public ResponseEntity<List<PrivilegesRoleDTO>> getMembershipDuration(@PathVariable("roleId") Long roleId) {
		return new ResponseEntity<>( privilegeService.findPrivilegeByRoleId(roleId), HttpStatus.OK);
	}
	@GetMapping(value = "getroles")
	public ResponseEntity<List<Role>> getRoles() {
		return new ResponseEntity<>( roleService.getRoles(), HttpStatus.OK);
	}
	@PostMapping(value = "updateroleprivilege")
	public ResponseEntity<Role> updateRolePrivilege(@RequestBody RolePrivilegeDTO rolePrivilegeDTO) {
		return new ResponseEntity<>(rolePrivilegeService.updateRolePrivilege(rolePrivilegeDTO), HttpStatus.OK);
	}
	@PostMapping(value = "createrole")
	public ResponseEntity<Role> updateRolePrivilege(@RequestBody CreateRoleDTO createRoleDTO) {
		return new ResponseEntity<>(roleService.createRole(createRoleDTO), HttpStatus.OK);
	}
	@GetMapping(value = "getusersroles")
	public ResponseEntity<List<UsersRolesView>> getUsersRoles() {
		return new ResponseEntity<>( usersRolesViewService.getUsersRoles(), HttpStatus.OK);
	}
	@PostMapping(value = "updateuserrole")
	public ResponseEntity<User> updateUserRole(@RequestBody UserRoleDTO userRoleDTO) {
		return new ResponseEntity<>(userRoleService.updateUserRole(userRoleDTO), HttpStatus.OK);
	}
}
