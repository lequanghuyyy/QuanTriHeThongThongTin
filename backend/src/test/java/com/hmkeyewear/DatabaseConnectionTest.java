package com.hmkeyewear;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseConnectionTest {
    
    public static void main(String[] args) {
        String url = "jdbc:mysql://mysql-2b1e48af-lequanghuy26012005-27e4.d.aivencloud.com:21454/defaultdb?sslMode=REQUIRED";
        String username = "avnadmin";
        String password = "AVNS_1Q6r7fRgU2o1xGAjIcE";
        
        System.out.println("===========================================");
        System.out.println("Testing Aiven MySQL Connection");
        System.out.println("===========================================");
        System.out.println("Host: mysql-2b1e48af-lequanghuy26012005-27e4.d.aivencloud.com");
        System.out.println("Port: 21454");
        System.out.println("Database: defaultdb");
        System.out.println("User: " + username);
        System.out.println("===========================================\n");
        
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        
        try {
            // Load MySQL JDBC Driver
            System.out.println("1. Loading MySQL JDBC Driver...");
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("   ✓ Driver loaded successfully\n");
            
            // Establish connection
            System.out.println("2. Connecting to Aiven MySQL...");
            conn = DriverManager.getConnection(url, username, password);
            System.out.println("   ✓ Connection established successfully!\n");
            
            // Test query - Get MySQL version
            System.out.println("3. Testing query execution...");
            stmt = conn.createStatement();
            rs = stmt.executeQuery("SELECT VERSION() as version, DATABASE() as current_db, NOW() as server_time");
            
            if (rs.next()) {
                System.out.println("   ✓ Query executed successfully!");
                System.out.println("\n   Database Info:");
                System.out.println("   - MySQL Version: " + rs.getString("version"));
                System.out.println("   - Current Database: " + rs.getString("current_db"));
                System.out.println("   - Server Time: " + rs.getString("server_time"));
            }
            
            // List existing tables
            System.out.println("\n4. Checking existing tables...");
            rs = stmt.executeQuery("SHOW TABLES");
            
            boolean hasTables = false;
            System.out.println("   Tables in database:");
            while (rs.next()) {
                System.out.println("   - " + rs.getString(1));
                hasTables = true;
            }
            
            if (!hasTables) {
                System.out.println("   (No tables found - database is empty)");
            }
            
            System.out.println("\n===========================================");
            System.out.println("✓ CONNECTION TEST SUCCESSFUL!");
            System.out.println("===========================================");
            System.out.println("\nYour Aiven MySQL database is ready to use.");
            System.out.println("You can now:");
            System.out.println("1. Import your local database");
            System.out.println("2. Deploy backend to Render");
            
        } catch (ClassNotFoundException e) {
            System.err.println("\n✗ ERROR: MySQL JDBC Driver not found!");
            System.err.println("   Make sure mysql-connector-j is in pom.xml");
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("\n✗ CONNECTION FAILED!");
            System.err.println("   Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Close resources
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) {
                    conn.close();
                    System.out.println("\nConnection closed.");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
