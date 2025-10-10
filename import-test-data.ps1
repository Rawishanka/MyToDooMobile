# Import Test Data into MongoDB for MyToDoo App
# Run this script to populate your database with test data for the 5 new endpoints

Write-Host "🚀 Importing test data for MyToDoo Mobile App endpoints..." -ForegroundColor Green

# MongoDB connection details
$mongoHost = "localhost"
$mongoPort = "27017"
$databaseName = "Airtasker"

Write-Host "📊 Database: $databaseName" -ForegroundColor Cyan
Write-Host "🔗 Connection: $mongoHost`:$mongoPort" -ForegroundColor Cyan

try {
    # 1. Import Offers Collection
    Write-Host "`n1️⃣ Importing offers collection..." -ForegroundColor Yellow
    mongoimport --host $mongoHost --port $mongoPort --db $databaseName --collection offers --file "test-data/offers-collection.json" --jsonArray
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Offers collection imported successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to import offers collection" -ForegroundColor Red
    }

    # 2. Import Payments Collection
    Write-Host "`n2️⃣ Importing payments collection..." -ForegroundColor Yellow
    mongoimport --host $mongoHost --port $mongoPort --db $databaseName --collection payments --file "test-data/payments-collection.json" --jsonArray
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Payments collection imported successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to import payments collection" -ForegroundColor Red
    }

    # 3. Import Task Questions Collection
    Write-Host "`n3️⃣ Importing task_questions collection..." -ForegroundColor Yellow
    mongoimport --host $mongoHost --port $mongoPort --db $databaseName --collection task_questions --file "test-data/task-questions-collection.json" --jsonArray
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Task questions collection imported successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to import task questions collection" -ForegroundColor Red
    }

    # 4. Import Task Completion Collection
    Write-Host "`n4️⃣ Importing task_completion collection..." -ForegroundColor Yellow
    mongoimport --host $mongoHost --port $mongoPort --db $databaseName --collection task_completion --file "test-data/task-completion-collection.json" --jsonArray
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Task completion collection imported successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to import task completion collection" -ForegroundColor Red
    }

    # 5. Import User Profiles Collection  
    Write-Host "`n5️⃣ Importing user_profiles collection..." -ForegroundColor Yellow
    mongoimport --host $mongoHost --port $mongoPort --db $databaseName --collection user_profiles --file "test-data/user-profiles-collection.json" --jsonArray
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ User profiles collection imported successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to import user profiles collection" -ForegroundColor Red
    }

    Write-Host "`n🎉 Data import completed!" -ForegroundColor Green
    Write-Host "`n📋 Summary of collections created:" -ForegroundColor Cyan
    Write-Host "   • offers (4 records) - for /api/tasks/:id/offers" -ForegroundColor White
    Write-Host "   • payments (4 records) - for /api/tasks/my-tasks/payment-status" -ForegroundColor White 
    Write-Host "   • task_questions (5 records) - for /api/tasks/:taskId/questions" -ForegroundColor White
    Write-Host "   • task_completion (3 records) - for /api/tasks/:taskId/completion-status" -ForegroundColor White
    Write-Host "   • user_profiles (4 records) - for /api/tasks/user/:userId" -ForegroundColor White

    Write-Host "`n🧪 Test these endpoints now:" -ForegroundColor Yellow
    Write-Host "   GET /api/tasks/684bba3bb1cb4111b3bded24/offers" -ForegroundColor Gray
    Write-Host "   GET /api/tasks/my-tasks/payment-status" -ForegroundColor Gray
    Write-Host "   GET /api/tasks/684bba3bb1cb4111b3bded24/questions" -ForegroundColor Gray
    Write-Host "   GET /api/tasks/684bba3bb1cb4111b3bded24/completion-status" -ForegroundColor Gray
    Write-Host "   GET /api/tasks/user/684a610ab1cb4111b3bdea10" -ForegroundColor Gray

} catch {
    Write-Host "`n❌ Error occurred during import: $_" -ForegroundColor Red
    Write-Host "Make sure MongoDB is running and mongoimport is in your PATH" -ForegroundColor Yellow
}

Write-Host "`n💡 You can now test all 5 new endpoints in your mobile app!" -ForegroundColor Magenta