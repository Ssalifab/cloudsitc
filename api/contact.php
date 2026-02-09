<?php
header('Content-Type: application/json; charset=utf-8');

// Allow same-origin only; on cPanel the site will be same-origin
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Fallback to form-encoded POST (non-JS fallback)
if (!$data) $data = $_POST;

$errors = [];

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$company = trim($data['company'] ?? '');
$service = trim($data['service'] ?? '');
$budget = trim($data['budget'] ?? '');
$message = trim($data['message'] ?? '');

if (strlen($name) < 2) $errors['name'] = 'Please enter your full name.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please enter a valid email address.';
if (strlen($phone) < 7) $errors['phone'] = 'Please enter a valid phone number.';
if (strlen($service) < 2) $errors['service'] = 'Please select a service.';
if (strlen($message) < 10) $errors['message'] = 'Please add a short message (min 10 characters).';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// Recipient (change here if needed)
$to = getenv('SALES_EMAIL') ?: 'sales@cloudsitc.com';

$subject = sprintf('Website quote request: %s — %s', $service, $company ?: $name);

$body = "<p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>";
$body .= "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
$body .= "<p><strong>Phone:</strong> " . htmlspecialchars($phone) . "</p>";
$body .= "<p><strong>Company:</strong> " . htmlspecialchars($company) . "</p>";
$body .= "<p><strong>Service:</strong> " . htmlspecialchars($service) . "</p>";
$body .= "<p><strong>Budget:</strong> " . htmlspecialchars($budget) . "</p>";
$body .= "<hr/>";
$body .= "<p><strong>Message:</strong></p>";
$body .= "<p>" . nl2br(htmlspecialchars($message)) . "</p>";

$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
$headers .= "From: " . ($company ? htmlspecialchars($company) . " <no-reply@" . $_SERVER['SERVER_NAME'] . ">" : "no-reply@" . $_SERVER['SERVER_NAME']) . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";

$sent = false;
try {
    // Try PHP mail(); on cPanel this usually works when mail is configured
    $sent = mail($to, $subject, $body, $headers);
} catch (Exception $e) {
    error_log('Mail send error: ' . $e->getMessage());
}

if ($sent) {
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(500);
echo json_encode(['ok' => false, 'error' => 'Failed to send message.']);

?>
