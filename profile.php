<?php
session_start();
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Profile</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .profile-card {
            width: 100%;
            max-width: 450px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            text-align: center;
            position: relative;
        }
        
        .profile-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 0 30px;
            color: white;
        }
        
        .profile-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid white;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            margin-bottom: 15px;
        }
        
        .profile-name {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .profile-email {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .profile-body {
            padding: 30px;
        }
        
        .profile-details {
            margin-bottom: 25px;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f1f1f1;
        }
        
        .detail-item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .logout-btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(103, 126, 234, 0.4);
        }
        
        .logout-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(103, 126, 234, 0.6);
        }
        
        .logout-btn:active {
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <div class="profile-card">
        <div class="profile-header">
            <!-- Default profile photo with first letter of username -->
            <img src="https://ui-avatars.com/api/?name=<?php echo urlencode($_SESSION['username']); ?>&background=random&color=fff&size=120" 
                 alt="Profile Photo" class="profile-photo">
            <h1 class="profile-name"><?php echo htmlspecialchars($_SESSION['username']); ?></h1>
            <p class="profile-email"><?php echo htmlspecialchars($_SESSION['email']); ?></p>
        </div>
        
        <div class="profile-body">
            <div class="profile-details">
                <div class="detail-item">
                    <p>Welcome back to your profile! Here you can view your account details and manage your settings.</p>
                </div>
                <div class="detail-item">
                    <p><strong>Member since:</strong> <?php echo date('F Y'); ?></p>
                </div>
            </div>
            
            <a href="logout.php" class="logout-btn">Logout</a>
        </div>
    </div>
</body>
</html>