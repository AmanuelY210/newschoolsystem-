-- School Management System - MySQL Database Dump
-- For phpMyAdmin Import
-- Generated: 2026-07-03
-- Database: school_management

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Create Database
CREATE DATABASE IF NOT EXISTS school_management CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE school_management;

-- Table: Student
CREATE TABLE IF NOT EXISTS `Student` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `userId` LONGTEXT NOT NULL,
    `studentId` LONGTEXT NOT NULL,
    `firstName` LONGTEXT NOT NULL,
    `lastName` LONGTEXT NOT NULL,
    `gender` LONGTEXT NOT NULL DEFAULT 'male',
    `dateOfBirth` DATETIME,
    `bloodGroup` LONGTEXT,
    `nationalId` LONGTEXT,
    `gradeId` LONGTEXT,
    `sectionId` LONGTEXT,
    `guardianName` LONGTEXT,
    `guardianPhone` LONGTEXT,
    `guardianEmail` LONGTEXT,
    `address` LONGTEXT,
    `enrollmentDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `photoUrl` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,
    CONSTRAINT `Student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Student_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `Grade` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `Student_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Data for Student (17 rows)
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh8d0003vh6ak4787qan', 'STU-2024-001', 'Hanan', 'Ali', 'female', 1210809600000, 'O+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Ali Mohammed', '+251911123456', 'ali@example.com', 'Bole, Addis Ababa', 1782962608229, 'active', '', 1782962608229, 1782962608229);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh9i001nvh6a5ldawr1d', 'STU-2024-002', 'Kidist', 'Tesfaye', 'female', 1200355200000, 'A+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Kidist', '+25191120002', NULL, 'Addis Ababa, Ethiopia', 1782962608232, 'active', NULL, 1782962608232, 1782962608232);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9m001svh6airmik7e7', 'cmr2xwh9l001qvh6agpigp6u2', 'STU-2024-003', 'Bethel', 'Assefa', 'female', 1203033600000, 'B+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Bethel', '+25191120003', NULL, 'Addis Ababa, Ethiopia', 1782962608235, 'active', NULL, 1782962608235, 1782962608235);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh9o001tvh6aj2uotucd', 'STU-2024-004', 'Nahom', 'Solomon', 'male', 1205539200000, 'O+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Nahom', '+25191120004', NULL, 'Addis Ababa, Ethiopia', 1782962608237, 'active', NULL, 1782962608237, 1782962608237);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh9q001wvh6ahqzdii4v', 'STU-2024-005', 'Ruth', 'Girma', 'female', 1208217600000, 'AB+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Ruth', '+25191120005', NULL, 'Addis Ababa, Ethiopia', 1782962608239, 'active', NULL, 1782962608239, 1782962608239);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh9s001zvh6ap9xtul5c', 'STU-2024-006', 'Abel', 'Mekonnen', 'male', 1210809600000, 'O-', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Abel', '+25191120006', NULL, 'Addis Ababa, Ethiopia', 1782962608241, 'active', NULL, 1782962608241, 1782962608241);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh9u0022vh6aggqs9jef', 'STU-2024-007', 'Selam', 'Worku', 'female', 1213488000000, 'A+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Selam', '+25191120007', NULL, 'Addis Ababa, Ethiopia', 1782962608243, 'active', NULL, 1782962608243, 1782962608243);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh9w0025vh6a017okxj3', 'STU-2024-008', 'Daniel', 'Bekele', 'male', 1216080000000, 'B+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Daniel', '+25191120008', NULL, 'Addis Ababa, Ethiopia', 1782962608245, 'active', NULL, 1782962608245, 1782962608245);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh9y0028vh6au27r1sx9', 'STU-2024-009', 'Hanna', 'Girmay', 'female', 1218758400000, 'O+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Hanna', '+25191120009', NULL, 'Addis Ababa, Ethiopia', 1782962608249, 'active', NULL, 1782962608249, 1782962608249);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwha1002bvh6aotakjjss', 'STU-2024-010', 'Yabets', 'Haile', 'male', 1221436800000, 'AB+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Yabets', '+251911200010', NULL, 'Addis Ababa, Ethiopia', 1782962608251, 'active', NULL, 1782962608251, 1782962608251);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwha4002gvh6arxeriibn', 'cmr2xwha3002evh6aaf9wvr9z', 'STU-2024-011', 'Liya', 'Tariku', 'female', 1224028800000, 'O-', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Liya', '+251911200011', NULL, 'Addis Ababa, Ethiopia', 1782962608253, 'active', NULL, 1782962608253, 1782962608253);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwha6002jvh6af2xo944s', 'cmr2xwha5002hvh6avaf6ex0x', 'STU-2024-012', 'Noah', 'Teshome', 'male', 1226707200000, 'A+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Noah', '+251911200012', NULL, 'Addis Ababa, Ethiopia', 1782962608255, 'active', NULL, 1782962608255, 1782962608255);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwha7002kvh6a0iw3cded', 'STU-2024-013', 'Eden', 'Asfaw', 'female', 1229299200000, 'B+', NULL, 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'Parent of Eden', '+251911200013', NULL, 'Addis Ababa, Ethiopia', 1782962608257, 'active', NULL, 1782962608257, 1782962608257);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr34atwj0003vhnkwo68k8dv', 'cmr34atwg0001vhnktciiiegz', 'STU-2026-014', 'Sara', 'Ahmed', 'female', NULL, NULL, NULL, 'cmr2xwh8p000fvh6agzgn8hgu', NULL, 'Ahmed', '+251911223344', NULL, NULL, 1782973355491, 'active', NULL, 1782973355491, 1782973355491);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr37r4ca000avhs4dtdr7qmc', 'cmr37r4c70008vhs4pboxm6mr', 'STU-2026-015', 'Amanuel', 'Yigzaw', 'male', 1265068800000, NULL, '76543456789076', 'cmr2xwh8o000evh6aofp83i8k', NULL, 'Tsion Yigzaw Zelalem', '098765434567', 'et.amanuelyigzaw@gmail.com', 'Tulu Dimtu', 1782979154362, 'active', '/uploads/student-photos/1782978684514-r2r965i.jpg', 1782979154362, 1782979154362);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr380yc3000ovhs4rf0e9w3h', 'cmr380yc0000mvhs4vg94mvgw', 'STU-2026-016', 'Test', 'Custom', 'male', NULL, NULL, NULL, 'cmr2xwh8o000evh6aofp83i8k', NULL, 'Parent', '+251911999999', NULL, NULL, 1782979613140, 'active', NULL, 1782979613140, 1782979613140);
INSERT INTO `Student` (`id`, `userId`, `studentId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `bloodGroup`, `nationalId`, `gradeId`, `sectionId`, `guardianName`, `guardianPhone`, `guardianEmail`, `address`, `enrollmentDate`, `status`, `photoUrl`, `createdAt`, `updatedAt`) VALUES ('cmr4rwmu0001fnexy1g1kl8nj', 'cmr4rwmtx001dnexy78xitjpe', 'AYZM-2026-0017', 'Yigzaw', 'Zelalem', 'male', 1276646400000, NULL, '978634567890876543', 'cmr2xwh8p000fvh6agzgn8hgu', NULL, 'Alazar Yigzaw', '098765434', 'dschjsjcsghdc@gmail.com', 'Tulu Dimtu', 1783073470105, 'active', '/uploads/student-photos/1783073096938-rd20ncj.jpg', 1783073470105, 1783073470105);

-- Table: Teacher
CREATE TABLE IF NOT EXISTS `Teacher` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `userId` LONGTEXT NOT NULL,
    `teacherId` LONGTEXT NOT NULL,
    `firstName` LONGTEXT NOT NULL,
    `lastName` LONGTEXT NOT NULL,
    `gender` LONGTEXT NOT NULL DEFAULT 'male',
    `dateOfBirth` DATETIME,
    `qualification` LONGTEXT,
    `specialization` LONGTEXT,
    `experience` INT NOT NULL DEFAULT 0,
    `phone` LONGTEXT,
    `address` LONGTEXT,
    `joinDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `salary` DOUBLE NOT NULL DEFAULT 0,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `photoUrl` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL, `academicYear` LONGTEXT, `campus` LONGTEXT,
    CONSTRAINT `Teacher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Data for Teacher (6 rows)
INSERT INTO `Teacher` (`id`, `userId`, `teacherId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `qualification`, `specialization`, `experience`, `phone`, `address`, `joinDate`, `salary`, `status`, `photoUrl`, `createdAt`, `updatedAt`, `academicYear`, `campus`) VALUES ('cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8c0002vh6aogelanqj', 'TCH-2024-001', 'Abebe', 'Bekele', 'male', NULL, 'MSc in Mathematics', 'Mathematics & Physics', 12, '+251911000003', 'Addis Ababa, Ethiopia', 1782962608214, 25000.0, 'active', '', 1782962608214, 1782962608214, NULL, NULL);
INSERT INTO `Teacher` (`id`, `userId`, `teacherId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `qualification`, `specialization`, `experience`, `phone`, `address`, `joinDate`, `salary`, `status`, `photoUrl`, `createdAt`, `updatedAt`, `academicYear`, `campus`) VALUES ('cmr2xwh940018vh6anoqr5175', 'cmr2xwh930016vh6atjmdb2ck', 'TCH-2024-002', 'Sara', 'Mohamed', 'female', NULL, 'BA/BSc Degree', 'English & Literature', 5, '+25191100004', 'Addis Ababa, Ethiopia', 1782962608217, 22000.0, 'active', NULL, 1782962608217, 1782962608217, NULL, NULL);
INSERT INTO `Teacher` (`id`, `userId`, `teacherId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `qualification`, `specialization`, `experience`, `phone`, `address`, `joinDate`, `salary`, `status`, `photoUrl`, `createdAt`, `updatedAt`, `academicYear`, `campus`) VALUES ('cmr2xwh97001bvh6auavrh9ew', 'cmr2xwh960019vh6abytu0l86', 'TCH-2024-003', 'Dawit', 'Tadesse', 'male', NULL, 'BA/BSc Degree', 'Biology & Chemistry', 6, '+25191100005', 'Addis Ababa, Ethiopia', 1782962608220, 23000.0, 'active', NULL, 1782962608220, 1782962608220, NULL, NULL);
INSERT INTO `Teacher` (`id`, `userId`, `teacherId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `qualification`, `specialization`, `experience`, `phone`, `address`, `joinDate`, `salary`, `status`, `photoUrl`, `createdAt`, `updatedAt`, `academicYear`, `campus`) VALUES ('cmr2xwh9a001evh6aqrrsrn56', 'cmr2xwh99001cvh6axhn9kylu', 'TCH-2024-004', 'Meriem', 'Hassan', 'female', NULL, 'BA/BSc Degree', 'Physics & ICT', 7, '+25191100006', 'Addis Ababa, Ethiopia', 1782962608223, 24000.0, 'active', NULL, 1782962608223, 1782962608223, NULL, NULL);
INSERT INTO `Teacher` (`id`, `userId`, `teacherId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `qualification`, `specialization`, `experience`, `phone`, `address`, `joinDate`, `salary`, `status`, `photoUrl`, `createdAt`, `updatedAt`, `academicYear`, `campus`) VALUES ('cmr2xwh9d001hvh6ar4vyhgnd', 'cmr2xwh9c001fvh6aam65xovc', 'TCH-2024-005', 'Yonas', 'Girma', 'male', NULL, 'BA/BSc Degree', 'History & Geography', 8, '+25191100007', 'Addis Ababa, Ethiopia', 1782962608225, 21000.0, 'active', NULL, 1782962608225, 1782962608225, NULL, NULL);
INSERT INTO `Teacher` (`id`, `userId`, `teacherId`, `firstName`, `lastName`, `gender`, `dateOfBirth`, `qualification`, `specialization`, `experience`, `phone`, `address`, `joinDate`, `salary`, `status`, `photoUrl`, `createdAt`, `updatedAt`, `academicYear`, `campus`) VALUES ('cmr2xwh9f001kvh6amb6a6bod', 'cmr2xwh9e001ivh6arwen1t5e', 'TCH-2024-006', 'Fatima', 'Ahmed', 'female', NULL, 'BA/BSc Degree', 'Amharic & Civics', 9, '+25191100008', 'Addis Ababa, Ethiopia', 1782962608227, 20000.0, 'active', NULL, 1782962608227, 1782962608227, NULL, NULL);

-- Table: Mark
CREATE TABLE IF NOT EXISTS `Mark` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `studentId` LONGTEXT NOT NULL,
    `teacherId` LONGTEXT,
    `subjectId` LONGTEXT NOT NULL,
    `term` LONGTEXT NOT NULL DEFAULT 'Term 1',
    `assessmentType` LONGTEXT NOT NULL DEFAULT 'exam',
    `score` DOUBLE NOT NULL,
    `totalScore` DOUBLE NOT NULL DEFAULT 100,
    `grade` LONGTEXT,
    `remarks` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,
    CONSTRAINT `Mark_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Mark_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `Mark_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Data for Mark (66 rows)
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhab002ovh6a9ty6i7lc', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 73.0, 100.0, 'C+', NULL, 1782962608260, 1782962608260);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhad002qvh6aef0ovabv', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 70.0, 100.0, 'C+', NULL, 1782962608261, 1782962608261);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhad002svh6ay74yj4jk', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 74.0, 100.0, 'C+', NULL, 1782962608262, 1782962608262);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhag002uvh6ab37lkha0', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 92.0, 100.0, 'A+', NULL, 1782962608264, 1782962608264);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhah002wvh6attjhm7tt', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 74.0, 100.0, 'C+', NULL, 1782962608265, 1782962608265);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhai002yvh6ass1n0k9w', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 65.0, 100.0, 'C+', NULL, 1782962608266, 1782962608266);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhaj0030vh6a7xuw4hmr', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 84.0, 100.0, 'B+', NULL, 1782962608267, 1782962608267);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhaj0032vh6a4jen2byr', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 66.0, 100.0, 'C+', NULL, 1782962608268, 1782962608268);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhak0034vh6a36cz6hsx', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 69.0, 100.0, 'C+', NULL, 1782962608269, 1782962608269);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhal0036vh6acfurv0s3', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 87.0, 100.0, 'A', NULL, 1782962608270, 1782962608270);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwham0038vh6as9l5r3he', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 61.0, 100.0, 'C', NULL, 1782962608270, 1782962608270);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhan003avh6aqhgikzol', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 74.0, 100.0, 'C+', NULL, 1782962608271, 1782962608271);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhao003cvh6awvr2962c', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8t000lvh6ar888adil', 'Term 1', 'exam', 62.0, 100.0, 'C', NULL, 1782962608272, 1782962608272);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhao003evh6agv2x462z', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 90.0, 100.0, 'A+', NULL, 1782962608273, 1782962608273);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhap003gvh6ago91m8es', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 98.0, 100.0, 'A+', NULL, 1782962608274, 1782962608274);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhaq003ivh6alg4aftxw', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 85.0, 100.0, 'A', NULL, 1782962608274, 1782962608274);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhar003kvh6aseoxny4c', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 60.0, 100.0, 'C', NULL, 1782962608275, 1782962608275);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhas003mvh6a1udkzeuw', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 67.0, 100.0, 'C+', NULL, 1782962608276, 1782962608276);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhat003ovh6a1ikqiw2a', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 82.0, 100.0, 'B+', NULL, 1782962608277, 1782962608277);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhau003qvh6a4jmrji3z', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 99.0, 100.0, 'A+', NULL, 1782962608279, 1782962608279);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhaw003svh6ab9hjwdif', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 64.0, 100.0, 'C', NULL, 1782962608281, 1782962608281);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhax003uvh6asrwhn7g8', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 93.0, 100.0, 'A+', NULL, 1782962608281, 1782962608281);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhay003wvh6a2pk2h26s', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 68.0, 100.0, 'C+', NULL, 1782962608282, 1782962608282);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhaz003yvh6a37hr9gm3', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 62.0, 100.0, 'C', NULL, 1782962608284, 1782962608284);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb00040vh6agjvj1a3k', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 62.0, 100.0, 'C', NULL, 1782962608285, 1782962608285);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb10042vh6aawfgji7c', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8u000nvh6adz7rj53d', 'Term 1', 'exam', 87.0, 100.0, 'A', NULL, 1782962608285, 1782962608285);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb20044vh6aks2e15n1', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 61.0, 100.0, 'C', NULL, 1782962608286, 1782962608286);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb30046vh6aggnj8m3k', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 79.0, 100.0, 'B', NULL, 1782962608287, 1782962608287);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb40048vh6a9wodp9u0', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 72.0, 100.0, 'C+', NULL, 1782962608288, 1782962608288);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb4004avh6auv2ph9wh', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 93.0, 100.0, 'A+', NULL, 1782962608289, 1782962608289);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb5004cvh6atjnqrbnd', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 96.0, 100.0, 'A+', NULL, 1782962608290, 1782962608290);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb6004evh6awww7svir', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 95.0, 100.0, 'A+', NULL, 1782962608291, 1782962608291);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb7004gvh6an8il13fm', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 95.0, 100.0, 'A+', NULL, 1782962608291, 1782962608291);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhb8004ivh6a6q6w4ov7', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 68.0, 100.0, 'C+', NULL, 1782962608292, 1782962608292);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbb004kvh6a2ydmcq7w', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 95.0, 100.0, 'A+', NULL, 1782962608295, 1782962608295);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbd004mvh6aelmrn4j8', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 90.0, 100.0, 'A+', NULL, 1782962608297, 1782962608297);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbf004ovh6aacwrsglz', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 93.0, 100.0, 'A+', NULL, 1782962608300, 1782962608300);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbg004qvh6a4cn8lqyy', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 86.0, 100.0, 'A', NULL, 1782962608301, 1782962608301);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbh004svh6aphgia72k', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 81.0, 100.0, 'B+', NULL, 1782962608302, 1782962608302);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbi004uvh6aji8i03jg', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 77.0, 100.0, 'B', NULL, 1782962608303, 1782962608303);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbj004wvh6axt72c0lj', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 62.0, 100.0, 'C', NULL, 1782962608303, 1782962608303);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbk004yvh6a7rfzu8s2', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 70.0, 100.0, 'C+', NULL, 1782962608304, 1782962608304);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbl0050vh6aclhrozb8', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 65.0, 100.0, 'C+', NULL, 1782962608305, 1782962608305);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbm0052vh6au50ssxea', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 83.0, 100.0, 'B+', NULL, 1782962608306, 1782962608306);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbm0054vh6aw5crrxvb', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 91.0, 100.0, 'A+', NULL, 1782962608307, 1782962608307);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbn0056vh6a5duosaqq', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 82.0, 100.0, 'B+', NULL, 1782962608308, 1782962608308);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbo0058vh6a5i6vhsmh', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 99.0, 100.0, 'A+', NULL, 1782962608308, 1782962608308);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbp005avh6ai1rdbzjg', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 99.0, 100.0, 'A+', NULL, 1782962608309, 1782962608309);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbq005cvh6a99yehv0j', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 82.0, 100.0, 'B+', NULL, 1782962608310, 1782962608310);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbs005evh6a57m0qjqe', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 70.0, 100.0, 'C+', NULL, 1782962608312, 1782962608312);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbt005gvh6av53o1qt8', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 66.0, 100.0, 'C+', NULL, 1782962608313, 1782962608313);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbu005ivh6abydw18p6', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8v000rvh6a3p3colz4', 'Term 1', 'exam', 78.0, 100.0, 'B', NULL, 1782962608314, 1782962608314);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbu005kvh6areh6kf8f', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 66.0, 100.0, 'C+', NULL, 1782962608315, 1782962608315);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbv005mvh6ape1vyi6n', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 75.0, 100.0, 'B', NULL, 1782962608316, 1782962608316);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbw005ovh6abvdfrgzx', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 85.0, 100.0, 'A', NULL, 1782962608316, 1782962608316);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbx005qvh6a3skntyy7', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 66.0, 100.0, 'C+', NULL, 1782962608317, 1782962608317);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhby005svh6auzohjyd9', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 88.0, 100.0, 'A', NULL, 1782962608318, 1782962608318);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbz005uvh6a7qe0w1ps', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 67.0, 100.0, 'C+', NULL, 1782962608319, 1782962608319);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhbz005wvh6athp7bj4y', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 86.0, 100.0, 'A', NULL, 1782962608320, 1782962608320);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhc0005yvh6aa9dv3a53', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 76.0, 100.0, 'B', NULL, 1782962608321, 1782962608321);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhc10060vh6a6lqxvgzz', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 81.0, 100.0, 'B+', NULL, 1782962608321, 1782962608321);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhc20062vh6aw2m4g6w4', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 94.0, 100.0, 'A+', NULL, 1782962608322, 1782962608322);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhc30064vh6albw559y6', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 64.0, 100.0, 'C', NULL, 1782962608323, 1782962608323);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhc30066vh6a6j2ujz9j', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 73.0, 100.0, 'C+', NULL, 1782962608324, 1782962608324);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhc40068vh6a80m8oxjt', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8w000tvh6a21pelric', 'Term 1', 'exam', 81.0, 100.0, 'B+', NULL, 1782962608325, 1782962608325);
INSERT INTO `Mark` (`id`, `studentId`, `teacherId`, `subjectId`, `term`, `assessmentType`, `score`, `totalScore`, `grade`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr4nclvq0001nessditzjnq1', 'cmr37r4ca000avhs4dtdr7qmc', NULL, 'cmr2xwh8v000pvh6ajeyolnjq', 'Term 1', 'exam', 90.0, 100.0, 'A+', NULL, 1783065817286, 1783065817286);

-- Table: Attendance
CREATE TABLE IF NOT EXISTS `Attendance` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `studentId` LONGTEXT NOT NULL,
    `teacherId` LONGTEXT,
    `date` DATETIME NOT NULL,
    `status` LONGTEXT NOT NULL DEFAULT 'present',
    `remarks` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Attendance_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Data for Attendance (65 rows)
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhc6006avh6aqjfh1ckg', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'absent', NULL, 1782962608326);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhc8006cvh6abisbb73d', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'absent', NULL, 1782962608328);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhc9006evh6a39s3u8xm', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608329);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhc9006gvh6a4e60ujbr', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608330);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhca006ivh6audkge5zn', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608331);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcb006kvh6aswlii6fh', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608331);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcc006mvh6alyf7j47l', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608332);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcc006ovh6agc27z1k7', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608333);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcd006qvh6atsv80n2g', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'absent', NULL, 1782962608334);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhce006svh6aedu4g2vl', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608335);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcf006uvh6azcx6qpqf', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608335);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcg006wvh6ath9vcds0', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608336);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhch006yvh6ajz5i07ge', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 1782962608325, 'present', NULL, 1782962608337);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhci0070vh6ade22vhj5', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'late', NULL, 1782962608338);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcj0072vh6al30p0xiv', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608339);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcj0074vh6amlvqb17n', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608340);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhck0076vh6a9npm8yiv', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608341);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcl0078vh6aoxt4ufzv', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608341);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcm007avh6a53u60g9t', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608342);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhco007cvh6afuvjivt5', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608345);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcp007evh6a0ew8mv0j', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608346);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcq007gvh6ar665hexz', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608347);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcr007ivh6aeu1t1s54', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608347);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcw007kvh6asisez52g', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608352);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcx007mvh6a1plsc7xg', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'present', NULL, 1782962608353);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcy007ovh6a4rbbts70', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 1782876208325, 'late', NULL, 1782962608354);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcy007qvh6aavbsa27k', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608355);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhcz007svh6a1kmy8zwp', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'late', NULL, 1782962608355);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhd0007uvh6az3ga76d1', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608356);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhd0007wvh6awk7u7yv1', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608357);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhd1007yvh6aysmkwp7h', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608358);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhd20080vh6av9eex1pc', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608358);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhd40082vh6a6biuw3lk', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608361);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhd50084vh6amet69023', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608362);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhd70086vh6a7h2derr1', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608364);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhd80088vh6ajgmtu0wt', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608365);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhd9008avh6afokl6d6u', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608366);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhda008cvh6ak8dl6dbw', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'absent', NULL, 1782962608366);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdb008evh6ahhvv83ey', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 1782789808325, 'present', NULL, 1782962608367);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdc008gvh6ag6ajh62h', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608368);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdc008ivh6a6pkcrtc3', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'absent', NULL, 1782962608369);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdd008kvh6aywrliw92', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608369);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhde008mvh6agluaf3q3', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608370);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdf008ovh6a0dc7l1nm', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608371);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdf008qvh6aw5g5ylx1', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608372);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdg008svh6aj0iay02s', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608372);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdg008uvh6a3def7f8x', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608373);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdh008wvh6a43bvcjps', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608374);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdi008yvh6a216xt2l2', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608374);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdk0090vh6awl5xu4ie', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608376);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdk0092vh6aor1q83ho', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608377);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdl0094vh6akkt8x7f9', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 1782703408325, 'present', NULL, 1782962608377);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdm0096vh6a98sdmb7r', 'cmr2xwh9h001mvh6ar0b2vbeo', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608378);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdm0098vh6ahc4bh03u', 'cmr2xwh9k001pvh6ar89n5b9m', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608379);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdn009avh6aglz02r20', 'cmr2xwh9m001svh6airmik7e7', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608379);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdo009cvh6al8q62awd', 'cmr2xwh9p001vvh6alrql5cl5', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608380);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdo009evh6ajc70li6j', 'cmr2xwh9r001yvh6a5uk8yi7u', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608381);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdp009gvh6asvj9gk0i', 'cmr2xwh9t0021vh6aiv06sotq', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608381);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdq009ivh6a9sx6fau9', 'cmr2xwh9v0024vh6a40i5arxm', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608382);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdq009kvh6axq02itpk', 'cmr2xwh9x0027vh6aw8lvqxbd', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608383);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdr009mvh6aqy1h00vg', 'cmr2xwha0002avh6ahsx2ve0p', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'late', NULL, 1782962608383);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdr009ovh6amcb85thn', 'cmr2xwha2002dvh6adtlzmi2k', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608384);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhds009qvh6a8rbre4us', 'cmr2xwha4002gvh6arxeriibn', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608385);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdt009svh6a3z9yusj8', 'cmr2xwha6002jvh6af2xo944s', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608385);
INSERT INTO `Attendance` (`id`, `studentId`, `teacherId`, `date`, `status`, `remarks`, `createdAt`) VALUES ('cmr2xwhdu009uvh6aljhiaxhs', 'cmr2xwha8002mvh6a25fjfpzc', 'cmr2xwh910015vh6avfm5tppr', 1782617008325, 'present', NULL, 1782962608386);

-- Table: Assignment
CREATE TABLE IF NOT EXISTS `Assignment` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `title` LONGTEXT NOT NULL,
    `description` LONGTEXT NOT NULL,
    `subjectId` LONGTEXT NOT NULL,
    `teacherId` LONGTEXT NOT NULL,
    `dueDate` DATETIME NOT NULL,
    `maxScore` DOUBLE NOT NULL DEFAULT 100,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Assignment_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Assignment_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Data for Assignment (2 rows)
INSERT INTO `Assignment` (`id`, `title`, `description`, `subjectId`, `teacherId`, `dueDate`, `maxScore`, `status`, `createdAt`) VALUES ('cmr2xwhdv009wvh6a1vcagbae', 'Algebra Chapter 3 - Linear Equations', 'Solve problems 1-20 from Chapter 3. Show all working steps.', 'cmr2xwh8t000lvh6ar888adil', 'cmr2xwh910015vh6avfm5tppr', 1783567408387, 100.0, 'active', 1782962608387);
INSERT INTO `Assignment` (`id`, `title`, `description`, `subjectId`, `teacherId`, `dueDate`, `maxScore`, `status`, `createdAt`) VALUES ('cmr2xwhdw009yvh6asoksttny', 'Essay: My Future Career', 'Write a 500-word essay about your future career goals.', 'cmr2xwh8u000nvh6adz7rj53d', 'cmr2xwh910015vh6avfm5tppr', 1783394608388, 50.0, 'active', 1782962608388);

-- Table: AssignmentSubmission
CREATE TABLE IF NOT EXISTS `AssignmentSubmission` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `assignmentId` LONGTEXT NOT NULL,
    `studentId` LONGTEXT NOT NULL,
    `submittedById` LONGTEXT,
    `content` LONGTEXT NOT NULL,
    `fileUrl` LONGTEXT,
    `submittedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `score` DOUBLE,
    `feedback` LONGTEXT,
    `status` LONGTEXT NOT NULL DEFAULT 'submitted',
    CONSTRAINT `AssignmentSubmission_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `AssignmentSubmission_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `AssignmentSubmission_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: Promotion
CREATE TABLE IF NOT EXISTS `Promotion` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `studentId` LONGTEXT NOT NULL,
    `fromGrade` LONGTEXT NOT NULL,
    `toGrade` LONGTEXT NOT NULL,
    `academicYear` LONGTEXT NOT NULL,
    `promoted` TINYINT(1) NOT NULL DEFAULT true,
    `remarks` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Promotion_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: ReportCard
CREATE TABLE IF NOT EXISTS `ReportCard` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `studentId` LONGTEXT NOT NULL,
    `term` LONGTEXT NOT NULL,
    `academicYear` LONGTEXT NOT NULL,
    `totalScore` DOUBLE,
    `average` DOUBLE,
    `rank` INT,
    `remarks` LONGTEXT,
    `pdfUrl` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Rank
CREATE TABLE IF NOT EXISTS `Rank` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `studentId` LONGTEXT NOT NULL,
    `term` LONGTEXT NOT NULL,
    `academicYear` LONGTEXT NOT NULL,
    `rank` INT NOT NULL,
    `totalScore` DOUBLE NOT NULL,
    `average` DOUBLE NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: FinanceStaff
CREATE TABLE IF NOT EXISTS `FinanceStaff` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `userId` LONGTEXT NOT NULL,
    `staffId` LONGTEXT NOT NULL,
    `firstName` LONGTEXT NOT NULL,
    `lastName` LONGTEXT NOT NULL,
    `phone` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `FinanceStaff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Data for FinanceStaff (1 rows)
INSERT INTO `FinanceStaff` (`id`, `userId`, `staffId`, `firstName`, `lastName`, `phone`, `createdAt`) VALUES ('cmr2xwheq00b6vh6a5ftgc9yz', 'cmr2xwh8f0004vh6az000mnui', 'FIN-001', 'Finance', 'Manager', '+251911000005', 1782962608419);

-- Table: FinanceTransaction
CREATE TABLE IF NOT EXISTS `FinanceTransaction` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `transactionId` LONGTEXT NOT NULL,
    `studentId` LONGTEXT,
    `type` LONGTEXT NOT NULL,
    `category` LONGTEXT NOT NULL DEFAULT 'tuition',
    `amount` DOUBLE NOT NULL,
    `paymentMethod` LONGTEXT NOT NULL DEFAULT 'cash',
    `bankReference` LONGTEXT,
    `description` LONGTEXT,
    `status` LONGTEXT NOT NULL DEFAULT 'completed',
    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,
    CONSTRAINT `FinanceTransaction_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Data for FinanceTransaction (13 rows)
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhdx00a0vh6atubb90v7', 'TXN-2024-0001', 'cmr2xwh9h001mvh6ar0b2vbeo', 'fee_payment', 'tuition', 8500.0, 'cash', NULL, 'Term 1 Tuition Fee - Hanan Ali', 'completed', 1782962608389, 1782962608389, 1782962608389);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhdy00a2vh6amb4g6u27', 'TXN-2024-0002', 'cmr2xwh9k001pvh6ar89n5b9m', 'fee_payment', 'tuition', 8500.0, 'telebirr', 'REF1001', 'Term 1 Tuition Fee - Kidist Tesfaye', 'completed', 1782962608390, 1782962608390, 1782962608390);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe000a4vh6asrdkimon', 'TXN-2024-0003', 'cmr2xwh9m001svh6airmik7e7', 'fee_payment', 'tuition', 8500.0, 'cbe', 'REF1002', 'Term 1 Tuition Fee - Bethel Assefa', 'completed', 1782962608392, 1782962608392, 1782962608392);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe100a6vh6a9qoc4kcp', 'TXN-2024-0004', 'cmr2xwh9p001vvh6alrql5cl5', 'fee_payment', 'tuition', 8500.0, 'dashen', 'REF1003', 'Term 1 Tuition Fee - Nahom Solomon', 'completed', 1782962608393, 1782962608393, 1782962608393);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe200a8vh6aecmnho6w', 'TXN-2024-0005', 'cmr2xwh9r001yvh6a5uk8yi7u', 'fee_payment', 'tuition', 8500.0, 'awash', 'REF1004', 'Term 1 Tuition Fee - Ruth Girma', 'completed', 1782962608394, 1782962608394, 1782962608394);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe300aavh6a9c08noli', 'TXN-2024-0006', 'cmr2xwh9t0021vh6aiv06sotq', 'fee_payment', 'tuition', 8500.0, 'cash', NULL, 'Term 1 Tuition Fee - Abel Mekonnen', 'completed', 1782962608395, 1782962608395, 1782962608395);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe300acvh6afwml3k8y', 'TXN-2024-0007', 'cmr2xwh9v0024vh6a40i5arxm', 'fee_payment', 'tuition', 8500.0, 'telebirr', 'REF1006', 'Term 1 Tuition Fee - Selam Worku', 'completed', 1782962608396, 1782962608396, 1782962608396);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe400aevh6a48jqrtk7', 'TXN-2024-0008', 'cmr2xwh9x0027vh6aw8lvqxbd', 'fee_payment', 'tuition', 8500.0, 'cbe', 'REF1007', 'Term 1 Tuition Fee - Daniel Bekele', 'completed', 1782962608397, 1782962608397, 1782962608397);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe500agvh6aw632xadc', 'TXN-2024-0009', 'cmr2xwha0002avh6ahsx2ve0p', 'fee_payment', 'tuition', 8500.0, 'dashen', 'REF1008', 'Term 1 Tuition Fee - Hanna Girmay', 'completed', 1782962608398, 1782962608398, 1782962608398);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe600aivh6a833l7co9', 'TXN-2024-0010', 'cmr2xwha2002dvh6adtlzmi2k', 'fee_payment', 'tuition', 8500.0, 'awash', 'REF1009', 'Term 1 Tuition Fee - Yabets Haile', 'completed', 1782962608398, 1782962608398, 1782962608398);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe700akvh6aptx4xsky', 'TXN-2024-0011', 'cmr2xwha4002gvh6arxeriibn', 'fee_payment', 'tuition', 8500.0, 'cash', NULL, 'Term 1 Tuition Fee - Liya Tariku', 'completed', 1782962608399, 1782962608399, 1782962608399);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe800amvh6ax9f89m0a', 'TXN-2024-0012', 'cmr2xwha6002jvh6af2xo944s', 'fee_payment', 'tuition', 8500.0, 'telebirr', 'REF1011', 'Term 1 Tuition Fee - Noah Teshome', 'completed', 1782962608400, 1782962608400, 1782962608400);
INSERT INTO `FinanceTransaction` (`id`, `transactionId`, `studentId`, `type`, `category`, `amount`, `paymentMethod`, `bankReference`, `description`, `status`, `date`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhe900aovh6ajgmo8gp9', 'TXN-2024-0013', 'cmr2xwha8002mvh6a25fjfpzc', 'fee_payment', 'tuition', 8500.0, 'cbe', 'REF1012', 'Term 1 Tuition Fee - Eden Asfaw', 'completed', 1782962608401, 1782962608401, 1782962608401);

-- Table: FeeStructure
CREATE TABLE IF NOT EXISTS `FeeStructure` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `name` LONGTEXT NOT NULL,
    `gradeId` LONGTEXT,
    `amount` DOUBLE NOT NULL,
    `category` LONGTEXT NOT NULL DEFAULT 'tuition',
    `academicYear` LONGTEXT NOT NULL,
    `term` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Librarian
CREATE TABLE IF NOT EXISTS `Librarian` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `userId` LONGTEXT NOT NULL,
    `staffId` LONGTEXT NOT NULL,
    `firstName` LONGTEXT NOT NULL,
    `lastName` LONGTEXT NOT NULL,
    `phone` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Librarian_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Data for Librarian (1 rows)
INSERT INTO `Librarian` (`id`, `userId`, `staffId`, `firstName`, `lastName`, `phone`, `createdAt`) VALUES ('cmr2xwher00b8vh6ai41qg2f4', 'cmr2xwh8g0005vh6abxxaw2qj', 'LIB-001', 'Library', 'Manager', '+251911000006', 1782962608420);

-- Table: Book
CREATE TABLE IF NOT EXISTS `Book` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `bookId` LONGTEXT NOT NULL,
    `title` LONGTEXT NOT NULL,
    `author` LONGTEXT NOT NULL,
    `isbn` LONGTEXT,
    `category` LONGTEXT NOT NULL DEFAULT 'general',
    `publisher` LONGTEXT,
    `edition` LONGTEXT,
    `year` INT,
    `totalCopies` INT NOT NULL DEFAULT 1,
    `availableCopies` INT NOT NULL DEFAULT 1,
    `shelfLocation` LONGTEXT,
    `description` LONGTEXT,
    `coverUrl` LONGTEXT,
    `status` LONGTEXT NOT NULL DEFAULT 'available',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL
);

-- Data for Book (10 rows)
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhea00apvh6adadxmaff', 'BK-001', 'Principles of Mathematics', 'John Doe', NULL, 'Mathematics', NULL, NULL, 2023, 5, 4, 'Shelf-A', NULL, NULL, 'available', 1782962608402, 1782962608414);
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwheb00aqvh6aakk5sz5j', 'BK-002', 'English Grammar in Use', 'Raymond Murphy', NULL, 'English', NULL, NULL, 2022, 8, 3, 'Shelf-B', NULL, NULL, 'available', 1782962608403, 1782962608416);
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhec00arvh6an1oynb25', 'BK-003', 'Introduction to Physics', 'David Halliday', NULL, 'Science', NULL, NULL, 2023, 4, 3, 'Shelf-C', NULL, NULL, 'available', 1782962608404, 1782962608418);
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhec00asvh6avmty441u', 'BK-004', 'Chemistry: The Central Science', 'Brown, LeMay', NULL, 'Science', NULL, NULL, 2021, 3, 1, 'Shelf-D', NULL, NULL, 'available', 1782962608405, 1782962608405);
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhed00atvh6an4g4mr4p', 'BK-005', 'Biology Concepts', 'Campbell', NULL, 'Science', NULL, NULL, 2023, 6, 6, 'Shelf-E', NULL, NULL, 'available', 1782962608406, 1782962608406);
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhee00auvh6a7hvtxc7m', 'BK-006', 'World History', 'Ellis Esler', NULL, 'History', NULL, NULL, 2020, 4, 4, 'Shelf-F', NULL, NULL, 'available', 1782962608406, 1782962608406);
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwheg00avvh6alq3b7f74', 'BK-007', 'Geography of Africa', 'Barry Kinsey', NULL, 'Geography', NULL, NULL, 2022, 3, 3, 'Shelf-G', NULL, NULL, 'available', 1782962608408, 1782962608408);
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwheh00awvh6azhnzms82', 'BK-008', 'Amharic Literature', 'Bekele Megerssa', NULL, 'Literature', NULL, NULL, 2023, 5, 5, 'Shelf-H', NULL, NULL, 'available', 1782962608409, 1782962608409);
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwheh00axvh6a2rfjf390', 'BK-009', 'Computer Science Basics', 'J. Glenn Brookshear', NULL, 'ICT', NULL, NULL, 2024, 7, 5, 'Shelf-I', NULL, NULL, 'available', 1782962608410, 1782962608410);
INSERT INTO `Book` (`id`, `bookId`, `title`, `author`, `isbn`, `category`, `publisher`, `edition`, `year`, `totalCopies`, `availableCopies`, `shelfLocation`, `description`, `coverUrl`, `status`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhei00ayvh6aly4rke8h', 'BK-010', 'Civics and Ethics', 'Ethiopian Ministry', NULL, 'Civics', NULL, NULL, 2023, 10, 7, 'Shelf-J', NULL, NULL, 'available', 1782962608411, 1782968521341);

-- Table: LibraryLoan
CREATE TABLE IF NOT EXISTS `LibraryLoan` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `bookId` LONGTEXT NOT NULL,
    `studentId` LONGTEXT,
    `borrowerName` LONGTEXT NOT NULL,
    `borrowerType` LONGTEXT NOT NULL DEFAULT 'student',
    `borrowDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `dueDate` DATETIME NOT NULL,
    `returnDate` DATETIME,
    `status` LONGTEXT NOT NULL DEFAULT 'borrowed',
    `fine` DOUBLE NOT NULL DEFAULT 0,
    `remarks` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,
    CONSTRAINT `LibraryLoan_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `LibraryLoan_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Data for LibraryLoan (5 rows)
INSERT INTO `LibraryLoan` (`id`, `bookId`, `studentId`, `borrowerName`, `borrowerType`, `borrowDate`, `dueDate`, `returnDate`, `status`, `fine`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhek00b0vh6a0iyu5kde', 'cmr2xwhea00apvh6adadxmaff', 'cmr2xwh9h001mvh6ar0b2vbeo', 'Hanan Ali', 'student', 1782962608413, 1784172208412, NULL, 'borrowed', 0.0, NULL, 1782962608413, 1782962608413);
INSERT INTO `LibraryLoan` (`id`, `bookId`, `studentId`, `borrowerName`, `borrowerType`, `borrowDate`, `dueDate`, `returnDate`, `status`, `fine`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwhem00b2vh6af7xnl9us', 'cmr2xwheb00aqvh6aakk5sz5j', 'cmr2xwh9k001pvh6ar89n5b9m', 'Kidist Tesfaye', 'student', 1782962608415, 1784172208414, NULL, 'borrowed', 0.0, NULL, 1782962608415, 1782962608415);
INSERT INTO `LibraryLoan` (`id`, `bookId`, `studentId`, `borrowerName`, `borrowerType`, `borrowDate`, `dueDate`, `returnDate`, `status`, `fine`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr2xwheo00b4vh6acdlteo67', 'cmr2xwhec00arvh6an1oynb25', 'cmr2xwh9m001svh6airmik7e7', 'Bethel Assefa', 'student', 1782962608417, 1784172208416, NULL, 'borrowed', 0.0, NULL, 1782962608417, 1782962608417);
INSERT INTO `LibraryLoan` (`id`, `bookId`, `studentId`, `borrowerName`, `borrowerType`, `borrowDate`, `dueDate`, `returnDate`, `status`, `fine`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr31dnnj0003vhvz8tpdtoqa', 'cmr2xwhei00ayvh6aly4rke8h', 'cmr2xwha8002mvh6a25fjfpzc', 'Eden Asfaw', 'student', 1782968448511, 1782950400000, NULL, 'borrowed', 0.0, NULL, 1782968448511, 1782968448511);
INSERT INTO `LibraryLoan` (`id`, `bookId`, `studentId`, `borrowerName`, `borrowerType`, `borrowDate`, `dueDate`, `returnDate`, `status`, `fine`, `remarks`, `createdAt`, `updatedAt`) VALUES ('cmr31f7ul0005vhvzp9lna3ec', 'cmr2xwhei00ayvh6aly4rke8h', 'cmr2xwh9h001mvh6ar0b2vbeo', 'Hanan Ali', 'student', 1782968521341, 1782950400000, NULL, 'borrowed', 0.0, NULL, 1782968521341, 1782968521341);

-- Table: HRStaff
CREATE TABLE IF NOT EXISTS `HRStaff` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `staffId` LONGTEXT NOT NULL,
    `firstName` LONGTEXT NOT NULL,
    `lastName` LONGTEXT NOT NULL,
    `gender` LONGTEXT NOT NULL DEFAULT 'male',
    `department` LONGTEXT NOT NULL DEFAULT 'academic',
    `position` LONGTEXT NOT NULL,
    `phone` LONGTEXT,
    `email` LONGTEXT,
    `salary` DOUBLE NOT NULL DEFAULT 0,
    `joinDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL
);

-- Table: IDCard
CREATE TABLE IF NOT EXISTS `IDCard` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `personId` LONGTEXT NOT NULL,
    `personType` LONGTEXT NOT NULL DEFAULT 'student',
    `personName` LONGTEXT NOT NULL,
    `cardNumber` LONGTEXT NOT NULL,
    `issuedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expiryDate` DATETIME,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data for IDCard (1 rows)
INSERT INTO `IDCard` (`id`, `personId`, `personType`, `personName`, `cardNumber`, `issuedDate`, `expiryDate`, `status`, `createdAt`) VALUES ('cmr3106yt0000vhvzzd5b37gv', 'cmr2xwha8002mvh6a25fjfpzc', 'student', 'Eden Asfaw', 'IDC-2026-0001', 1782967820357, NULL, 'active', 1782967820357);

-- Table: Certificate
CREATE TABLE IF NOT EXISTS `Certificate` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `studentId` LONGTEXT,
    `studentName` LONGTEXT NOT NULL,
    `certificateType` LONGTEXT NOT NULL DEFAULT 'completion',
    `title` LONGTEXT NOT NULL,
    `description` LONGTEXT,
    `issuedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `certificateNumber` LONGTEXT NOT NULL,
    `signedBy` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data for Certificate (1 rows)
INSERT INTO `Certificate` (`id`, `studentId`, `studentName`, `certificateType`, `title`, `description`, `issuedDate`, `certificateNumber`, `signedBy`, `createdAt`) VALUES ('cmr310wgm0001vhvzdepbz4qn', 'cmr2xwha8002mvh6a25fjfpzc', 'Eden Asfaw', 'completion', 'Thanks ', NULL, 1782967853399, 'CERT-2026-0001', NULL, 1782967853399);

-- Table: CMSPage
CREATE TABLE IF NOT EXISTS `CMSPage` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `slug` LONGTEXT NOT NULL,
    `title` LONGTEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `bannerImage` LONGTEXT,
    `metaDescription` LONGTEXT,
    `published` TINYINT(1) NOT NULL DEFAULT true,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL
, `data` LONGTEXT);

-- Data for CMSPage (6 rows)
INSERT INTO `CMSPage` (`id`, `slug`, `title`, `content`, `bannerImage`, `metaDescription`, `published`, `createdAt`, `updatedAt`, `data`) VALUES ('cmr2xwhes00b9vh6axgdd2s1u', 'home', 'Home Page', 'Welcome to Bright Future Academy, where excellence meets opportunity. We are committed to providing quality education that empowers students to become future leaders. Our dedicated teachers, modern facilities, and comprehensive curriculum ensure every student reaches their full potential.', '', NULL, 1, 1782962608420, 1783072844941, '{"hero":{"badge":"Admissions Open for 2025 - 2026","title":"Welcome to School Of Amanuel","subtitle":"Where excellence meets opportunity. We are committed to providing quality education that empowers students to become future leaders.","image":"/uploads/cms/1783072841082-52dazpw.jpg","primaryCta":"Apply Now","secondaryCta":"Explore Academy"},"stats":[{"value":"2000+","label":"Students","icon":"users"},{"value":"50+","label":"Expert Teachers","icon":"teachers"},{"value":"19+","label":"Years of Excellence","icon":"award"},{"value":"25+","label":"Awards Won","icon":"calendar"}],"aboutPreview":{"badge":"About Us","title":"A tradition of academic excellence and character","description":"For nearly two decades, Bright Future Academy has been at the forefront of quality education in Ethiopia. Our holistic approach nurtures intellectual curiosity, moral integrity, and a lifelong love of learning.","image":"https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=70","buttonText":"Learn More About Us","features":[{"value":"Holistic education approach"},{"value":"Modern learning facilities"},{"value":"Experienced & caring faculty"},{"value":"Strong academic track record"}]},"programs":[{"title":"Primary School","grades":"Grades 1 - 6","description":"A nurturing foundation that builds curiosity, literacy, numeracy, and social skills.","icon":"bookopen"},{"title":"Junior School","grades":"Grades 7 - 8","description":"Bridging foundational learning with deeper subject mastery, critical thinking, and creativity.","icon":"graduation"},{"title":"Secondary School","grades":"Grades 9 - 12","description":"Rigorous academic preparation for university and beyond — with specialized tracks.","icon":"atom"}],"events":{"title":"Upcoming events","subtitle":"Mark your calendar","buttonText":"View Calendar"},"gallery":{"title":"Moments that make us proud","buttonText":"View Full Gallery"},"cta":{"title":"Begin your child''s journey with us","description":"Join a community where every child is known, valued, and inspired to achieve their personal best.","primaryButtonText":"Apply Online","secondaryButtonText":"Schedule a Visit"}}');
INSERT INTO `CMSPage` (`id`, `slug`, `title`, `content`, `bannerImage`, `metaDescription`, `published`, `createdAt`, `updatedAt`, `data`) VALUES ('cmr2xwhet00bavh6azn0cnacw', 'about', 'About Our School', 'Bright Future Academy was founded in 2005 with a mission to provide world-class education in Ethiopia. Over the years, we have grown into one of the leading educational institutions in the country, serving over 2,000 students from diverse backgrounds.

Our vision is to nurture responsible, knowledgeable, and skilled citizens who can contribute positively to society. We believe in holistic education that develops not just academic skills but also character, creativity, and critical thinking.', '', NULL, 1, 1782962608421, 1782962608421, NULL);
INSERT INTO `CMSPage` (`id`, `slug`, `title`, `content`, `bannerImage`, `metaDescription`, `published`, `createdAt`, `updatedAt`, `data`) VALUES ('cmr2xwheu00bbvh6amye60726', 'academy', 'Academic Programs', 'We offer comprehensive academic programs from Grade 1 to Grade 12, following the national curriculum with enhanced learning opportunities.

**Primary School (Grade 1-6):** Foundation in literacy, numeracy, and social skills.
**Junior School (Grade 7-8):** Expanded curriculum with science and technology focus.
**Secondary School (Grade 9-12):** College preparatory program with specialized tracks.

Our programs include:
- STEM Education
- Language Arts
- Social Studies
- Physical Education
- Arts & Music
- ICT Integration', '', NULL, 1, 1782962608422, 1782962608422, NULL);
INSERT INTO `CMSPage` (`id`, `slug`, `title`, `content`, `bannerImage`, `metaDescription`, `published`, `createdAt`, `updatedAt`, `data`) VALUES ('cmr2xwheu00bcvh6asu3jgpjt', 'admissions', 'Admissions', 'Admissions for the 2024-2025 academic year are now open!

**Admission Process:**
1. Submit online application form
2. Submit required documents (birth certificate, previous school records)
3. Entrance assessment for Grade 3 and above
4. Parent interview
5. Admission decision and enrollment

**Required Documents:**
- Completed application form
- Birth certificate copy
- 2 passport-size photos
- Previous school report card
- Medical record

**Age Requirements:**
- Grade 1: 6 years old by September 1
- Transfer students: age-appropriate placement

For inquiries, contact our admissions office at +251 11 234 5678.', '', NULL, 1, 1782962608423, 1782962608423, NULL);
INSERT INTO `CMSPage` (`id`, `slug`, `title`, `content`, `bannerImage`, `metaDescription`, `published`, `createdAt`, `updatedAt`, `data`) VALUES ('cmr2xwhew00bdvh6a8hvmgpnw', 'contact', 'Contact Us', 'Get in touch with us!

**Address:** Bole Road, Addis Ababa, Ethiopia
**Phone:** +251 11 234 5678
**Email:** info@brightfuture.edu
**Hours:** Monday-Friday 8:00 AM - 4:00 PM', '', NULL, 1, 1782962608425, 1782962608425, NULL);
INSERT INTO `CMSPage` (`id`, `slug`, `title`, `content`, `bannerImage`, `metaDescription`, `published`, `createdAt`, `updatedAt`, `data`) VALUES ('cmr4rkpp9000pnexystx467cb', 'teachers', 'Teachers Page', '', NULL, NULL, 1, 1783072913950, 1783072913950, '{"hero":{"badge":"Our Team","title":"Meet our dedicated teachers","subtitle":"Our experienced and passionate educators are the heart of Bright Future Academy.","image":"https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1920&q=70"},"intro":{"title":"Educators who inspire","content":"Our faculty brings together experienced educators from diverse backgrounds, all united by a shared passion for teaching and a commitment to student success. With small class sizes and a supportive environment, our teachers provide personalized attention to help every student thrive."},"stats":{"items":[{"value":"50+","label":"Expert Teachers"},{"value":"15+","label":"Average Years Experience"},{"value":"90%","label":"Hold Advanced Degrees"},{"value":"1:15","label":"Teacher-Student Ratio"}]}}');

-- Table: SiteSetting
CREATE TABLE IF NOT EXISTS `SiteSetting` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `key` LONGTEXT NOT NULL,
    `value` LONGTEXT NOT NULL,
    `updatedAt` DATETIME NOT NULL
);

-- Data for SiteSetting (24 rows)
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhex00bevh6a9mil7oqt', 'logo', '', 1783072731044);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhey00bfvh6a5rwnbkun', 'favicon', '', 1783071956235);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhey00bgvh6a4gbr1tkn', 'header_text', 'Bright Future Amanuel', 1782977649475);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhez00bhvh6a2yuq3v9f', 'footer_text', '© 2024 Bright Future Academy. All rights reserved. Empowering future leaders through quality education.', 1782977649475);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhf000bivh6av6m9tv4j', 'seo_title', 'Bright Future Academy - Quality Education in Ethiopia', 1782962608428);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhf000bjvh6a6h1jskfj', 'seo_description', 'Bright Future Academy provides world-class education from Grade 1 to 12 in Addis Ababa, Ethiopia. Join us for academic excellence.', 1782962608429);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhf100bkvh6aaq9ksb01', 'seo_keywords', 'school, education, Ethiopia, Addis Ababa, academy, primary, secondary, quality education', 1782962608429);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhf100blvh6azopbg6pa', 'school_name', 'Bright Future Academy Amanuel', 1783071921008);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhf200bmvh6athvgq8pv', 'school_address', 'Bole Road, Addis Ababa, Ethiopia', 1783071921008);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhf200bnvh6aq7e7azuw', 'school_phone', '+251 11 234 5678', 1783071921008);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhf300bovh6avk6hdpq2', 'school_email', 'info@brightfuture.edu', 1783071921008);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr2xwhf300bpvh6an262wu5n', 'primary_color', '#0f766e', 1783071921008);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgr000bvhs44lgdpli1', 'admission_prefix', 'AYZ', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgs000cvhs4wfyinzrq', 'admission_year', '2026', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgs000dvhs42rpjhzf9', 'admission_padding', '4', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgs000evhs4uwy0kggk', 'admission_start_number', '1', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgs000fvhs4r896bmny', 'student_id_prefix', 'AYZM', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgs000gvhs4eax6kwj8', 'student_id_padding', '4', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgs000hvhs42zidk4eo', 'application_id_prefix', 'TSI', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgs000ivhs4sqv603hn', 'tracking_prefix', 'ASB', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgs000jvhs4fb3zaeee', 'admission_fee_amount', '500', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr37zfgs000kvhs4m8u56p1s', 'admission_default_password', 'password123', 1783073037316);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr38cw9o000qvhs41e104cj3', 'school_tagline', 'Empowering Future Leaders', 1783071921008);
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmr38cw9o000rvhs41bknnb74', 'portal_name', 'SMS Portal', 1783071921008);

-- Table: SocialLink
CREATE TABLE IF NOT EXISTS `SocialLink` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `platform` LONGTEXT NOT NULL,
    `url` LONGTEXT NOT NULL,
    `icon` LONGTEXT,
    `active` TINYINT(1) NOT NULL DEFAULT true,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data for SocialLink (5 rows)
INSERT INTO `SocialLink` (`id`, `platform`, `url`, `icon`, `active`, `createdAt`) VALUES ('cmr2xwhf400bqvh6a5wdpayqc', 'facebook', 'https://facebook.com/brightfutureacademy', NULL, 1, 1782962608433);
INSERT INTO `SocialLink` (`id`, `platform`, `url`, `icon`, `active`, `createdAt`) VALUES ('cmr2xwhf500brvh6aba4fh7rv', 'twitter', 'https://twitter.com/bfacademy', NULL, 1, 1782962608433);
INSERT INTO `SocialLink` (`id`, `platform`, `url`, `icon`, `active`, `createdAt`) VALUES ('cmr2xwhf500bsvh6aesgj4e48', 'instagram', 'https://instagram.com/bfacademy', NULL, 1, 1782962608434);
INSERT INTO `SocialLink` (`id`, `platform`, `url`, `icon`, `active`, `createdAt`) VALUES ('cmr2xwhf600btvh6ars689oif', 'youtube', 'https://youtube.com/@bfacademy', NULL, 1, 1782962608435);
INSERT INTO `SocialLink` (`id`, `platform`, `url`, `icon`, `active`, `createdAt`) VALUES ('cmr2xwhf700buvh6ax7y1dbuh', 'telegram', 'https://t.me/bfacademy', NULL, 1, 1782962608435);

-- Table: MediaItem
CREATE TABLE IF NOT EXISTS `MediaItem` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `title` LONGTEXT NOT NULL,
    `description` LONGTEXT,
    `type` LONGTEXT NOT NULL,
    `url` LONGTEXT NOT NULL,
    `thumbnailUrl` LONGTEXT,
    `category` LONGTEXT NOT NULL DEFAULT 'general',
    `published` TINYINT(1) NOT NULL DEFAULT true,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data for MediaItem (8 rows)
INSERT INTO `MediaItem` (`id`, `title`, `description`, `type`, `url`, `thumbnailUrl`, `category`, `published`, `createdAt`) VALUES ('cmr2xwhf800bvvh6aixxepgfk', 'Annual Sports Day 2024', NULL, 'photo', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', 'sports', 1, 1782962608436);
INSERT INTO `MediaItem` (`id`, `title`, `description`, `type`, `url`, `thumbnailUrl`, `category`, `published`, `createdAt`) VALUES ('cmr2xwhf900bwvh6a2ybk7k2t', 'Science Exhibition', NULL, 'photo', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', 'event', 1, 1782962608437);
INSERT INTO `MediaItem` (`id`, `title`, `description`, `type`, `url`, `thumbnailUrl`, `category`, `published`, `createdAt`) VALUES ('cmr2xwhf900bxvh6a48wsf311', 'Graduation Ceremony', NULL, 'photo', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', 'graduation', 1, 1782962608438);
INSERT INTO `MediaItem` (`id`, `title`, `description`, `type`, `url`, `thumbnailUrl`, `category`, `published`, `createdAt`) VALUES ('cmr2xwhfa00byvh6a4wn8pivc', 'Library Reading Session', NULL, 'photo', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800', 'classroom', 1, 1782962608438);
INSERT INTO `MediaItem` (`id`, `title`, `description`, `type`, `url`, `thumbnailUrl`, `category`, `published`, `createdAt`) VALUES ('cmr2xwhfc00bzvh6aj559y5n5', 'Cultural Day Celebration', NULL, 'photo', 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=800', 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=800', 'event', 1, 1782962608440);
INSERT INTO `MediaItem` (`id`, `title`, `description`, `type`, `url`, `thumbnailUrl`, `category`, `published`, `createdAt`) VALUES ('cmr2xwhfd00c0vh6awbi8y5xm', 'Music Performance', NULL, 'photo', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', 'event', 1, 1782962608441);
INSERT INTO `MediaItem` (`id`, `title`, `description`, `type`, `url`, `thumbnailUrl`, `category`, `published`, `createdAt`) VALUES ('cmr2xwhfd00c1vh6aqtses8s3', 'School Tour Video', NULL, 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '', 'general', 1, 1782962608442);
INSERT INTO `MediaItem` (`id`, `title`, `description`, `type`, `url`, `thumbnailUrl`, `category`, `published`, `createdAt`) VALUES ('cmr2xwhfe00c2vh6ab3si846u', 'Annual Day Highlights', NULL, 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '', 'event', 1, 1782962608442);

-- Table: ContactMessage
CREATE TABLE IF NOT EXISTS `ContactMessage` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `name` LONGTEXT NOT NULL,
    `email` LONGTEXT NOT NULL,
    `phone` LONGTEXT,
    `subject` LONGTEXT NOT NULL,
    `message` LONGTEXT NOT NULL,
    `status` LONGTEXT NOT NULL DEFAULT 'new',
    `repliedById` LONGTEXT,
    `reply` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,
    CONSTRAINT `ContactMessage_repliedById_fkey` FOREIGN KEY (`repliedById`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Data for ContactMessage (1 rows)
INSERT INTO `ContactMessage` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `repliedById`, `reply`, `createdAt`, `updatedAt`) VALUES ('cmr31l22o0006vhvznlo6omak', 'John Doe', 'john@example.com', NULL, 'Inquiry about admission', 'I would like to know more about the admission process for Grade 5.', 'new', NULL, NULL, 1782968793793, 1782968793793);

-- Table: Notification
CREATE TABLE IF NOT EXISTS `Notification` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `userId` LONGTEXT,
    `title` LONGTEXT NOT NULL,
    `message` LONGTEXT NOT NULL,
    `type` LONGTEXT NOT NULL DEFAULT 'info',
    `read` TINYINT(1) NOT NULL DEFAULT false,
    `link` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: Event
CREATE TABLE IF NOT EXISTS `Event` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `title` LONGTEXT NOT NULL,
    `description` LONGTEXT,
    `date` DATETIME NOT NULL,
    `location` LONGTEXT,
    `type` LONGTEXT NOT NULL DEFAULT 'event',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data for Event (4 rows)
INSERT INTO `Event` (`id`, `title`, `description`, `date`, `location`, `type`, `createdAt`) VALUES ('cmr2xwhff00c3vh6aitruk7jy', 'First Term Examinations', NULL, 1783567408442, NULL, 'exam', 1782962608443);
INSERT INTO `Event` (`id`, `title`, `description`, `date`, `location`, `type`, `createdAt`) VALUES ('cmr2xwhff00c4vh6adq7v728s', 'Parent-Teacher Meeting', NULL, 1784172208442, NULL, 'meeting', 1782962608444);
INSERT INTO `Event` (`id`, `title`, `description`, `date`, `location`, `type`, `createdAt`) VALUES ('cmr2xwhfg00c5vh6arxhkbgh0', 'Sports Day', NULL, 1784777008442, NULL, 'event', 1782962608445);
INSERT INTO `Event` (`id`, `title`, `description`, `date`, `location`, `type`, `createdAt`) VALUES ('cmr2xwhfh00c6vh6a2ljhzsvf', 'Cultural Festival', NULL, 1785554608442, NULL, 'event', 1782962608445);

-- Table: RegistrationApplication
CREATE TABLE IF NOT EXISTS `RegistrationApplication` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `applicationId` LONGTEXT NOT NULL,
    `trackingNumber` LONGTEXT NOT NULL,
    `admissionNumber` LONGTEXT,
    `firstName` LONGTEXT NOT NULL,
    `lastName` LONGTEXT NOT NULL,
    `grandFatherName` LONGTEXT,
    `gender` LONGTEXT NOT NULL DEFAULT 'male',
    `program` LONGTEXT,
    `field` LONGTEXT,
    `mediaOfInstruction` LONGTEXT,
    `dateOfBirth` DATETIME,
    `age` INT,
    `nationalId` LONGTEXT,
    `studentPhoto` LONGTEXT,
    `applyForGrade` LONGTEXT,
    `lastGradeCompleted` LONGTEXT,
    `gradeAverage` LONGTEXT,
    `lastSchoolAttended` LONGTEXT,
    `registrationCondition` LONGTEXT,
    `guardianName` LONGTEXT NOT NULL,
    `guardianRelationship` LONGTEXT,
    `guardianPhone` LONGTEXT NOT NULL,
    `guardianEmail` LONGTEXT,
    `guardianAddress` LONGTEXT,
    `certificateFrontUrl` LONGTEXT,
    `certificateBackUrl` LONGTEXT,
    `studentIdFrontUrl` LONGTEXT,
    `parentPhotoUrl` LONGTEXT,
    `parentIdUrl` LONGTEXT,
    `clearanceUrl` LONGTEXT,
    `paymentMethod` LONGTEXT,
    `payCode` LONGTEXT,
    `paymentAmount` DOUBLE,
    `paymentReceiptUrl` LONGTEXT,
    `status` LONGTEXT NOT NULL DEFAULT 'submitted',
    `submittedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `reviewedAt` DATETIME,
    `reviewedBy` LONGTEXT,
    `reviewedByName` LONGTEXT,
    `remarks` LONGTEXT,
    `enrollRemarks` LONGTEXT,
    `enrolledAt` DATETIME,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL
);

-- Data for RegistrationApplication (4 rows)
INSERT INTO `RegistrationApplication` (`id`, `applicationId`, `trackingNumber`, `admissionNumber`, `firstName`, `lastName`, `grandFatherName`, `gender`, `program`, `field`, `mediaOfInstruction`, `dateOfBirth`, `age`, `nationalId`, `studentPhoto`, `applyForGrade`, `lastGradeCompleted`, `gradeAverage`, `lastSchoolAttended`, `registrationCondition`, `guardianName`, `guardianRelationship`, `guardianPhone`, `guardianEmail`, `guardianAddress`, `certificateFrontUrl`, `certificateBackUrl`, `studentIdFrontUrl`, `parentPhotoUrl`, `parentIdUrl`, `clearanceUrl`, `paymentMethod`, `payCode`, `paymentAmount`, `paymentReceiptUrl`, `status`, `submittedAt`, `reviewedAt`, `reviewedBy`, `reviewedByName`, `remarks`, `enrollRemarks`, `enrolledAt`, `createdAt`, `updatedAt`) VALUES ('cmr345hej0000vhnkz885aue8', 'APP-2026-001', 'TRK-2026-6INJP9', 'ADM-2026-014', 'Sara', 'Ahmed', NULL, 'female', 'Regular Program', NULL, NULL, NULL, NULL, NULL, NULL, 'Grade 10', NULL, NULL, NULL, NULL, 'Ahmed', NULL, '+251911223344', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'telebirr', 'SCH-2026-FCSII2', 500.0, NULL, 'enrolled', 1782973106012, 1782973355492, 'cmr2xwh870000vh6a910acz1c', 'Super Admin', '', NULL, 1782973355492, 1782973106012, 1782973355494);
INSERT INTO `RegistrationApplication` (`id`, `applicationId`, `trackingNumber`, `admissionNumber`, `firstName`, `lastName`, `grandFatherName`, `gender`, `program`, `field`, `mediaOfInstruction`, `dateOfBirth`, `age`, `nationalId`, `studentPhoto`, `applyForGrade`, `lastGradeCompleted`, `gradeAverage`, `lastSchoolAttended`, `registrationCondition`, `guardianName`, `guardianRelationship`, `guardianPhone`, `guardianEmail`, `guardianAddress`, `certificateFrontUrl`, `certificateBackUrl`, `studentIdFrontUrl`, `parentPhotoUrl`, `parentIdUrl`, `clearanceUrl`, `paymentMethod`, `payCode`, `paymentAmount`, `paymentReceiptUrl`, `status`, `submittedAt`, `reviewedAt`, `reviewedBy`, `reviewedByName`, `remarks`, `enrollRemarks`, `enrolledAt`, `createdAt`, `updatedAt`) VALUES ('cmr37jrio0007vhs4u890c48b', 'APP-2026-002', 'TRK-2026-VFGS1K', 'ADM-2026-015', 'Amanuel', 'Yigzaw', 'Zelalem', 'male', 'Regular Program', 'Natural Science', 'Afaan Oromoo', 1265068800000, 17, '76543456789076', '/uploads/student-photos/1782978684514-r2r965i.jpg', 'Grade 9', '8', '%', 'Leesaa', 'New Student', 'Tsion Yigzaw Zelalem', 'Sister', '098765434567', 'et.amanuelyigzaw@gmail.com', 'Tulu Dimtu', '/uploads/documents/1782978753434-tbjhwnk.png', '/uploads/documents/1782978760608-o1n5vql.jpg', '/uploads/documents/1782978764203-frnt6an.png', '/uploads/documents/1782978766833-pztzlyy.png', '/uploads/documents/1782978770992-kgj29xs.pdf', '/uploads/documents/1782978774501-0vl3enu.jpg', 'cbe', 'SCH-2026-NOFC1T', 500.0, '/uploads/receipts/1782978808887-6ha9jlf.JPG', 'enrolled', 1782978811153, 1782979154363, 'cmr2xwh8b0001vh6aat028rp4', 'School Admin', 'password123', 'amanuel@TDGSS.com
password123', 1782979154363, 1782978811153, 1782979154364);
INSERT INTO `RegistrationApplication` (`id`, `applicationId`, `trackingNumber`, `admissionNumber`, `firstName`, `lastName`, `grandFatherName`, `gender`, `program`, `field`, `mediaOfInstruction`, `dateOfBirth`, `age`, `nationalId`, `studentPhoto`, `applyForGrade`, `lastGradeCompleted`, `gradeAverage`, `lastSchoolAttended`, `registrationCondition`, `guardianName`, `guardianRelationship`, `guardianPhone`, `guardianEmail`, `guardianAddress`, `certificateFrontUrl`, `certificateBackUrl`, `studentIdFrontUrl`, `parentPhotoUrl`, `parentIdUrl`, `clearanceUrl`, `paymentMethod`, `payCode`, `paymentAmount`, `paymentReceiptUrl`, `status`, `submittedAt`, `reviewedAt`, `reviewedBy`, `reviewedByName`, `remarks`, `enrollRemarks`, `enrolledAt`, `createdAt`, `updatedAt`) VALUES ('cmr37zu1m000lvhs4gx6w0juo', 'APP-2026-003', 'TRK-2026-4OTKHI', 'BFA-2026-016', 'Test', 'Custom', NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Grade 9', NULL, NULL, NULL, NULL, 'Parent', NULL, '+251911999999', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'enrolled', 1782979560923, 1782979613141, 'cmr2xwh870000vh6a910acz1c', 'Super Admin', '', NULL, 1782979613141, 1782979560923, 1782979613142);
INSERT INTO `RegistrationApplication` (`id`, `applicationId`, `trackingNumber`, `admissionNumber`, `firstName`, `lastName`, `grandFatherName`, `gender`, `program`, `field`, `mediaOfInstruction`, `dateOfBirth`, `age`, `nationalId`, `studentPhoto`, `applyForGrade`, `lastGradeCompleted`, `gradeAverage`, `lastSchoolAttended`, `registrationCondition`, `guardianName`, `guardianRelationship`, `guardianPhone`, `guardianEmail`, `guardianAddress`, `certificateFrontUrl`, `certificateBackUrl`, `studentIdFrontUrl`, `parentPhotoUrl`, `parentIdUrl`, `clearanceUrl`, `paymentMethod`, `payCode`, `paymentAmount`, `paymentReceiptUrl`, `status`, `submittedAt`, `reviewedAt`, `reviewedBy`, `reviewedByName`, `remarks`, `enrollRemarks`, `enrolledAt`, `createdAt`, `updatedAt`) VALUES ('cmr4rt4cy001anexytf7g1xum', 'TSI-2026-004', 'ASB-2026-NPZR5K', 'AYZ-2026-0017', 'Yigzaw', 'Zelalem', 'Menegistu', 'male', 'Regular Program', 'Natural Science', 'Afaan Oromoo', 1276646400000, 20, '978634567890876543', '/uploads/student-photos/1783073096938-rd20ncj.jpg', 'Grade 10', '8', '6%', 'Amanuel School', 'New Student', 'Alazar Yigzaw', 'Brother', '098765434', 'dschjsjcsghdc@gmail.com', 'Tulu Dimtu', '/uploads/documents/1783073208600-bav2u7v.jpg', '/uploads/documents/1783073215627-3hoofc2.jpg', '/uploads/documents/1783073222472-kzi9x4k.jpg', '/uploads/documents/1783073229081-e62oz11.jpg', '/uploads/documents/1783073274608-sc5impy.jpg', '/uploads/documents/1783073285199-i8gde67.jpg', 'cbe', 'SCH-2026-GN6WNR', 500.0, '/uploads/receipts/1783073297452-jgwrw4o.jpg', 'approved', 1783073306195, 1783073652606, 'cmr2xwh870000vh6a910acz1c', 'Super Admin', 'Student Name

Yigzaw Zelalem

Admission Number

AYZ-2026-0017

Student ID

AYZM-2026-0017

Login Email

yigzaw.zelalem17@school.edu

Default Password

password123', 'Done', 1783073470106, 1783073306195, 1783073652608);

-- Table: AcademicYear
CREATE TABLE IF NOT EXISTS `AcademicYear` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `name` LONGTEXT NOT NULL,
    `startDate` DATETIME NOT NULL,
    `endDate` DATETIME NOT NULL,
    `isCurrent` TINYINT(1) NOT NULL DEFAULT false,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data for AcademicYear (1 rows)
INSERT INTO `AcademicYear` (`id`, `name`, `startDate`, `endDate`, `isCurrent`, `status`, `createdAt`) VALUES ('cmr4s3e7g001mnexya8i6yiga', '2026-2027', 1798761600000, 1827619200000, 0, 'active', 1783073785517);

-- Table: Semester
CREATE TABLE IF NOT EXISTS `Semester` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `academicYearId` LONGTEXT NOT NULL,
    `name` LONGTEXT NOT NULL,
    `startDate` DATETIME NOT NULL,
    `endDate` DATETIME NOT NULL,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Semester_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: Curriculum
CREATE TABLE IF NOT EXISTS `Curriculum` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `academicYearId` LONGTEXT,
    `subjectId` LONGTEXT NOT NULL,
    `title` LONGTEXT NOT NULL,
    `description` LONGTEXT,
    `topics` LONGTEXT,
    `objectives` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Curriculum_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `Curriculum_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: ExamType
CREATE TABLE IF NOT EXISTS `ExamType` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `name` LONGTEXT NOT NULL,
    `description` LONGTEXT,
    `totalMarks` DOUBLE NOT NULL DEFAULT 100,
    `weight` DOUBLE NOT NULL DEFAULT 100,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: GradingSystem
CREATE TABLE IF NOT EXISTS `GradingSystem` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `name` LONGTEXT NOT NULL,
    `minPercentage` DOUBLE NOT NULL,
    `maxPercentage` DOUBLE NOT NULL,
    `grade` LONGTEXT NOT NULL,
    `gradePoint` DOUBLE NOT NULL DEFAULT 0,
    `description` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Holiday
CREATE TABLE IF NOT EXISTS `Holiday` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `name` LONGTEXT NOT NULL,
    `date` DATETIME NOT NULL,
    `type` LONGTEXT NOT NULL DEFAULT 'holiday',
    `description` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Grade
CREATE TABLE IF NOT EXISTS `Grade` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `name` LONGTEXT NOT NULL,
    `code` LONGTEXT,
    `level` INT NOT NULL,
    `educationLevel` LONGTEXT NOT NULL DEFAULT 'secondary',
    `description` LONGTEXT,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data for Grade (12 rows)
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8h0006vh6a6z4qw26m', 'Grade 1', NULL, 1, 'secondary', NULL, 'active', 1782962608194);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8i0007vh6as9h6vwvq', 'Grade 2', NULL, 2, 'secondary', NULL, 'active', 1782962608194);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8j0008vh6avv5wn6gi', 'Grade 3', NULL, 3, 'secondary', NULL, 'active', 1782962608195);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8j0009vh6asr6ga9s5', 'Grade 4', NULL, 4, 'secondary', NULL, 'active', 1782962608196);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8k000avh6a5oomj28u', 'Grade 5', NULL, 5, 'secondary', NULL, 'active', 1782962608196);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8l000bvh6akiohap9t', 'Grade 6', NULL, 6, 'secondary', NULL, 'active', 1782962608198);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8m000cvh6aszlttkbt', 'Grade 7', NULL, 7, 'secondary', NULL, 'active', 1782962608198);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8n000dvh6a9sgnptr4', 'Grade 8', NULL, 8, 'secondary', NULL, 'active', 1782962608200);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8o000evh6aofp83i8k', 'Grade 9', NULL, 9, 'secondary', NULL, 'active', 1782962608201);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8p000fvh6agzgn8hgu', 'Grade 10', NULL, 10, 'secondary', NULL, 'active', 1782962608201);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8q000gvh6aurtxmr7d', 'Grade 11', NULL, 11, 'secondary', NULL, 'active', 1782962608202);
INSERT INTO `Grade` (`id`, `name`, `code`, `level`, `educationLevel`, `description`, `status`, `createdAt`) VALUES ('cmr2xwh8r000hvh6at68yd0ys', 'Grade 12', NULL, 12, 'secondary', NULL, 'active', 1782962608203);

-- Table: Section
CREATE TABLE IF NOT EXISTS `Section` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `name` LONGTEXT NOT NULL,
    `gradeId` LONGTEXT NOT NULL,
    `capacity` INT NOT NULL DEFAULT 40,
    `roomNumber` LONGTEXT,
    `classTeacherId` LONGTEXT,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Section_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `Grade` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Data for Section (1 rows)
INSERT INTO `Section` (`id`, `name`, `gradeId`, `capacity`, `roomNumber`, `classTeacherId`, `status`, `createdAt`) VALUES ('cmr2xwh8s000jvh6abd5hyeut', 'A', 'cmr2xwh8o000evh6aofp83i8k', 40, NULL, NULL, 'active', 1782962608204);

-- Table: Subject
CREATE TABLE IF NOT EXISTS `Subject` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `name` LONGTEXT NOT NULL,
    `code` LONGTEXT NOT NULL,
    `gradeId` LONGTEXT,
    `creditHours` INT NOT NULL DEFAULT 1,
    `passingMarks` DOUBLE NOT NULL DEFAULT 50,
    `totalMarks` DOUBLE NOT NULL DEFAULT 100,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Subject_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `Grade` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Data for Subject (10 rows)
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh8t000lvh6ar888adil', 'Mathematics', 'MATH', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608205);
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh8u000nvh6adz7rj53d', 'English', 'ENG', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608206);
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh8v000pvh6ajeyolnjq', 'Amharic', 'AMH', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608207);
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh8v000rvh6a3p3colz4', 'Physics', 'PHY', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608208);
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh8w000tvh6a21pelric', 'Chemistry', 'CHEM', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608209);
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh8x000vvh6atlbn3aop', 'Biology', 'BIO', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608210);
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh8y000xvh6aktcpfdha', 'History', 'HIST', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608210);
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh8z000zvh6afgow7ly0', 'Geography', 'GEO', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608211);
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh8z0011vh6ag24oub2o', 'Civics', 'CIV', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608212);
INSERT INTO `Subject` (`id`, `name`, `code`, `gradeId`, `creditHours`, `passingMarks`, `totalMarks`, `status`, `createdAt`) VALUES ('cmr2xwh900013vh6azwxpejz1', 'ICT', 'ICT', 'cmr2xwh8o000evh6aofp83i8k', 1, 50.0, 100.0, 'active', 1782962608213);

-- Table: TeacherAssignment
CREATE TABLE IF NOT EXISTS `TeacherAssignment` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `teacherId` LONGTEXT NOT NULL,
    `gradeId` LONGTEXT NOT NULL,
    `sectionId` LONGTEXT,
    `subjectId` LONGTEXT NOT NULL,
    `academicYearId` LONGTEXT,
    `academicYearName` LONGTEXT,
    `campus` LONGTEXT,
    `weeklyPeriods` INT NOT NULL DEFAULT 0,
    `room` LONGTEXT,
    `status` LONGTEXT NOT NULL DEFAULT 'active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `TeacherAssignment_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `TeacherAssignment_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `Grade` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `TeacherAssignment_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `TeacherAssignment_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `TeacherAssignment_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Data for TeacherAssignment (6 rows)
INSERT INTO `TeacherAssignment` (`id`, `teacherId`, `gradeId`, `sectionId`, `subjectId`, `academicYearId`, `academicYearName`, `campus`, `weeklyPeriods`, `room`, `status`, `createdAt`) VALUES ('cmr4nr8mq0001ne3tr8he4qfm', 'cmr2xwh910015vh6avfm5tppr', 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'cmr2xwh8t000lvh6ar888adil', NULL, NULL, NULL, 0, NULL, 'active', 1783066499954);
INSERT INTO `TeacherAssignment` (`id`, `teacherId`, `gradeId`, `sectionId`, `subjectId`, `academicYearId`, `academicYearName`, `campus`, `weeklyPeriods`, `room`, `status`, `createdAt`) VALUES ('cmr4nr8mr0003ne3tgnjm5qiq', 'cmr2xwh940018vh6anoqr5175', 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'cmr2xwh8u000nvh6adz7rj53d', NULL, NULL, NULL, 0, NULL, 'active', 1783066499956);
INSERT INTO `TeacherAssignment` (`id`, `teacherId`, `gradeId`, `sectionId`, `subjectId`, `academicYearId`, `academicYearName`, `campus`, `weeklyPeriods`, `room`, `status`, `createdAt`) VALUES ('cmr4nr8mu0005ne3tsoe75jui', 'cmr2xwh97001bvh6auavrh9ew', 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'cmr2xwh8v000pvh6ajeyolnjq', NULL, NULL, NULL, 0, NULL, 'active', 1783066499958);
INSERT INTO `TeacherAssignment` (`id`, `teacherId`, `gradeId`, `sectionId`, `subjectId`, `academicYearId`, `academicYearName`, `campus`, `weeklyPeriods`, `room`, `status`, `createdAt`) VALUES ('cmr4nr8mv0007ne3tewrgxijq', 'cmr2xwh9a001evh6aqrrsrn56', 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'cmr2xwh8v000rvh6a3p3colz4', NULL, NULL, NULL, 0, NULL, 'active', 1783066499959);
INSERT INTO `TeacherAssignment` (`id`, `teacherId`, `gradeId`, `sectionId`, `subjectId`, `academicYearId`, `academicYearName`, `campus`, `weeklyPeriods`, `room`, `status`, `createdAt`) VALUES ('cmr4nr8mw0009ne3tjc4hcnzp', 'cmr2xwh9d001hvh6ar4vyhgnd', 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'cmr2xwh8w000tvh6a21pelric', NULL, NULL, NULL, 0, NULL, 'active', 1783066499960);
INSERT INTO `TeacherAssignment` (`id`, `teacherId`, `gradeId`, `sectionId`, `subjectId`, `academicYearId`, `academicYearName`, `campus`, `weeklyPeriods`, `room`, `status`, `createdAt`) VALUES ('cmr4nr8mx000bne3t71qd5j3i', 'cmr2xwh9f001kvh6amb6a6bod', 'cmr2xwh8o000evh6aofp83i8k', 'cmr2xwh8s000jvh6abd5hyeut', 'cmr2xwh8x000vvh6atlbn3aop', NULL, NULL, NULL, 0, NULL, 'active', 1783066499961);

-- Table: Exam
CREATE TABLE IF NOT EXISTS `Exam` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `examTypeId` LONGTEXT NOT NULL,
    `academicYearId` LONGTEXT,
    `name` LONGTEXT NOT NULL,
    `gradeId` LONGTEXT,
    `subjectId` LONGTEXT,
    `examDate` DATETIME NOT NULL,
    `totalMarks` DOUBLE NOT NULL DEFAULT 100,
    `passingMarks` DOUBLE NOT NULL DEFAULT 50,
    `status` LONGTEXT NOT NULL DEFAULT 'scheduled',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Exam_examTypeId_fkey` FOREIGN KEY (`examTypeId`) REFERENCES `ExamType` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Exam_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `Exam_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `Grade` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `Exam_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: LessonPlan
CREATE TABLE IF NOT EXISTS `LessonPlan` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `subjectId` LONGTEXT NOT NULL,
    `teacherId` LONGTEXT,
    `title` LONGTEXT NOT NULL,
    `description` LONGTEXT,
    `content` LONGTEXT,
    `date` DATETIME,
    `duration` INT,
    `fileUrl` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `LessonPlan_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `LessonPlan_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: Timetable
CREATE TABLE IF NOT EXISTS `Timetable` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `gradeId` LONGTEXT NOT NULL,
    `sectionId` LONGTEXT,
    `subjectId` LONGTEXT NOT NULL,
    `teacherId` LONGTEXT,
    `dayOfWeek` LONGTEXT NOT NULL,
    `startTime` LONGTEXT NOT NULL,
    `endTime` LONGTEXT NOT NULL,
    `room` LONGTEXT,
    `academicYear` LONGTEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Timetable_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `Grade` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Timetable_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `Timetable_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Timetable_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: Session
CREATE TABLE IF NOT EXISTS `Session` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `token` LONGTEXT NOT NULL,
    `userId` LONGTEXT NOT NULL,
    `expires` DATETIME NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Data for Session (10 rows)
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr4qoais0001ne9oeg8k87hz', '4107d5185bef98bfcc4971ef34421629d7a957986d3af3a0453904b26208cf56', 'cmr2xwh870000vh6a910acz1c', 1783676201282, 1783071401284);
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr4qwonp0001nexygahaud0b', '3b266db3ce791837f23c251bbdcf7f5c9a8b02d1e6e094e67be37de22da8e49e', 'cmr2xwh870000vh6a910acz1c', 1783676592851, 1783071792853);
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr4qxwq90003nexy43ie9mco', '1258901408037e38b94045f8bec4d1df9b725ccc31cd8038dd5b6ebb237d16a8', 'cmr2xwh870000vh6a910acz1c', 1783676649968, 1783071849969);
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr4r2fmu000enexylv2281rr', '93591d63549da8ea8edc88ea04ef9f89913375ba8406784b562de94c95cfd8e8', 'cmr2xwh870000vh6a910acz1c', 1783676861093, 1783072061094);
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr4r3ey9000gnexy11dpwa2z', '60e7b055b4f3c8ba2154ca45a359cc8cb91da03190ef186e957084c97e8f00ef', 'cmr2xwh870000vh6a910acz1c', 1783676906864, 1783072106865);
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr4raiw9000inexy45d4pcl6', 'ce9b547ceb3d2c6e8a6ce5c216b1493dc2d68601332413e40fde6236781140e3', 'cmr2xwh870000vh6a910acz1c', 1783677238567, 1783072438569);
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr4rg810000lnexyygiyjix6', '55e468d0cf8b0ad05f9ebe7252f67d68ae320aee5e5fb34c0b1e95b02ce99894', 'cmr2xwh870000vh6a910acz1c', 1783677504420, 1783072704421);
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr5gia4o0001nat9dqk2ul1l', '4cd52af527ad1b0c74d827b2d72892a18bb13ee3e00282534ea9d26aa7dc158d', 'cmr2xwh870000vh6a910acz1c', 1783719590855, 1783114790856);
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr5hqhgi0001na5lqdrnr8xa', '75903ec17c08163d912e0427471df93b171180f42b30397feb8a9f94b47d2eab', 'cmr2xwh870000vh6a910acz1c', 1783721653217, 1783116853218);
INSERT INTO `Session` (`id`, `token`, `userId`, `expires`, `createdAt`) VALUES ('cmr5hu8bj0003na5lzwa1w8tu', '0ba63d3464409e797f62f49482fa04219db95d8364256952f6fb7c572a6bde45', 'cmr2xwh870000vh6a910acz1c', 1783721827998, 1783117027999);

-- Table: User
CREATE TABLE IF NOT EXISTS `User` (
    `id` LONGTEXT NOT NULL PRIMARY KEY,
    `email` LONGTEXT NOT NULL,
    `password` LONGTEXT NOT NULL,
    `name` LONGTEXT NOT NULL,
    `role` LONGTEXT NOT NULL DEFAULT 'student',
    `avatar` LONGTEXT,
    `phone` LONGTEXT,
    `address` LONGTEXT,
    `active` TINYINT(1) NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL
);

-- Data for User (27 rows)
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh870000vh6a910acz1c', 'superadmin@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Super Admin', 'super_admin', NULL, '+251911000001', NULL, 1, 1783117027995, 1782962608184, 1783117509698);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh8b0001vh6aat028rp4', 'admin@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'School Admin', 'admin', NULL, '+251911000002', NULL, 1, 1783073370392, 1782962608187, 1783073370394);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh8c0002vh6aogelanqj', 'teacher@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Abebe Bekele', 'teacher', NULL, '+251911000003', NULL, 1, 1783067139610, 1782962608189, 1783067139611);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh8d0003vh6ak4787qan', 'student@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Hanan Ali', 'student', NULL, '+251911000004', NULL, 1, 1783065401036, 1782962608190, 1783065401038);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh8f0004vh6az000mnui', 'finance@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Finance Manager', 'finance', NULL, '+251911000005', NULL, 1, 1783065454557, 1782962608191, 1783065454559);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh8g0005vh6abxxaw2qj', 'library@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Library Manager', 'library', NULL, '+251911000006', NULL, 1, 1783065479007, 1782962608192, 1783065479009);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh930016vh6atjmdb2ck', 'teacher2@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Sara Mohamed', 'teacher', NULL, '+25191100004', NULL, 1, NULL, 1782962608216, 1782962608216);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh960019vh6abytu0l86', 'teacher3@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Dawit Tadesse', 'teacher', NULL, '+25191100005', NULL, 1, NULL, 1782962608218, 1782962608218);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh99001cvh6axhn9kylu', 'teacher4@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Meriem Hassan', 'teacher', NULL, '+25191100006', NULL, 1, NULL, 1782962608221, 1782962608221);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9c001fvh6aam65xovc', 'teacher5@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Yonas Girma', 'teacher', NULL, '+25191100007', NULL, 1, NULL, 1782962608224, 1782962608224);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9e001ivh6arwen1t5e', 'teacher6@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Fatima Ahmed', 'teacher', NULL, '+25191100008', NULL, 1, NULL, 1782962608226, 1782962608226);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9i001nvh6a5ldawr1d', 'student2@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Kidist Tesfaye', 'student', NULL, '+25191110002', NULL, 1, NULL, 1782962608230, 1782962608230);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9l001qvh6agpigp6u2', 'student3@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Bethel Assefa', 'student', NULL, '+25191110003', NULL, 1, NULL, 1782962608234, 1782962608234);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9o001tvh6aj2uotucd', 'student4@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Nahom Solomon', 'student', NULL, '+25191110004', NULL, 1, NULL, 1782962608236, 1782962608236);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9q001wvh6ahqzdii4v', 'student5@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Ruth Girma', 'student', NULL, '+25191110005', NULL, 1, NULL, 1782962608238, 1782962608238);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9s001zvh6ap9xtul5c', 'student6@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Abel Mekonnen', 'student', NULL, '+25191110006', NULL, 1, NULL, 1782962608240, 1782962608240);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9u0022vh6aggqs9jef', 'student7@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Selam Worku', 'student', NULL, '+25191110007', NULL, 1, NULL, 1782962608243, 1782962608243);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9w0025vh6a017okxj3', 'student8@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Daniel Bekele', 'student', NULL, '+25191110008', NULL, 1, NULL, 1782962608245, 1782962608245);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwh9y0028vh6au27r1sx9', 'student9@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Hanna Girmay', 'student', NULL, '+25191110009', NULL, 1, NULL, 1782962608246, 1782962608246);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwha1002bvh6aotakjjss', 'student10@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Yabets Haile', 'student', NULL, '+251911100010', NULL, 1, NULL, 1782962608250, 1782962608250);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwha3002evh6aaf9wvr9z', 'student11@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Liya Tariku', 'student', NULL, '+251911100011', NULL, 1, NULL, 1782962608252, 1782962608252);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwha5002hvh6avaf6ex0x', 'student12@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Noah Teshome', 'student', NULL, '+251911100012', NULL, 1, NULL, 1782962608254, 1782962608254);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr2xwha7002kvh6a0iw3cded', 'student13@school.edu', '$2b$10$1FoLVHor/HqkGQWpb4MWge7hBeK9DF3V.rlw1QxKkjmp7nbJMk6nW', 'Eden Asfaw', 'student', NULL, '+251911100013', NULL, 1, NULL, 1782962608256, 1782962608256);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr34atwg0001vhnktciiiegz', 'sara.ahmed14@school.edu', '$2b$10$rryUp1UGNoI/uFtwqWM4yO38hsHYPGXXmH6axUDE6V2OHrK0OtGPW', 'Sara Ahmed', 'student', NULL, '+251911223344', NULL, 1, NULL, 1782973355488, 1782973355488);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr37r4c70008vhs4pboxm6mr', 'amanuel.yigzaw15@school.edu', '$2b$10$ElD/zUYtNuEl5.sRvdqXvuolv3NvDbQloAg0dOXCHKwI93jA6s/gu', 'Amanuel Yigzaw', 'student', '/uploads/student-photos/1782978684514-r2r965i.jpg', '098765434567', NULL, 1, 1782979764482, 1782979154359, 1782979764484);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr380yc0000mvhs4vg94mvgw', 'test.custom16@school.edu', '$2b$10$Vh6nQHRW/Jlflw2ksAIfoec2jbaJMpShfwiN5GfQMQgpBBpsI8ua.', 'Test Custom', 'student', NULL, '+251911999999', NULL, 1, NULL, 1782979613137, 1782979613137);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `address`, `active`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmr4rwmtx001dnexy78xitjpe', 'yigzaw.zelalem17@school.edu', '$2b$10$FauQ85P8Snv1FrOZiMmPGOG1yHjvx3FTJrmyQv9zv1xQNMC6iEISW', 'Yigzaw Zelalem', 'student', '/uploads/student-photos/1783073096938-rd20ncj.jpg', '098765434', NULL, 1, 1783073686259, 1783073470102, 1783073686260);
