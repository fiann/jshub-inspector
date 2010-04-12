require 'rubygems'
require 'sinatra'
require 'inspector.rb'

root_dir = File.dirname(__FILE__)

set :environment, ENV['RACK_ENV'].to_sym if ENV['RACK_ENV']
set :root,        root_dir
set :app_file,    File.join(root_dir, 'inspector.rb')
enable :logging, :dump_errors, :raise_errors

log = File.new("#{root_dir}/log/sinatra.log", "a+")
STDOUT.reopen(log)
STDERR.reopen(log)

disable :run

run Sinatra::Application