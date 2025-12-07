-- Enable realtime for payments and user_subscriptions tables
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE user_subscriptions;

-- Set replica identity for full row data on updates
ALTER TABLE payments REPLICA IDENTITY FULL;
ALTER TABLE user_subscriptions REPLICA IDENTITY FULL;