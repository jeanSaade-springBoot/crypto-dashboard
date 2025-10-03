package com.crypto.analysis.authsecurity.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.crypto.analysis.authsecurity.domain.Privilege;
import com.crypto.analysis.authsecurity.dto.PrivilegesRoleDTO;

public interface PrivilegeRepository extends JpaRepository<Privilege, Long> {

	 @Query(value = "select p.id , p.parent_id as parentId,  p.name,\r\n"
	 		+ "  (\r\n"
	 		+ "    select true\r\n"
	 		+ "    from \r\n"
	 		+ "      roles_privileges rp , \r\n"
	 		+ "      role r\r\n"
	 		+ "    where r.id = :roleId \r\n"
	 		+ "	  and p.id = rp.privilege_id \r\n"
	 		+ "   and r.id = rp.role_id \r\n"
	 		+ "  ) AS checked\r\n"
	 		+ "from  privilege p;",
			      nativeQuery = true)
	 public List<PrivilegesRoleDTO> findPrivilegeByRoleId(@Param("roleId") long roleId);
	 public Privilege findPrivilegeByName(String name);
}
