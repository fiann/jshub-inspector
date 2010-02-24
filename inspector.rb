# jsHub Tag Inspector development

require 'rubygems'
require 'sinatra'
gem 'sinatra-static-assets'
require 'sinatra/static_assets'
require 'haml'


get '/' do
  haml :index
end

get '/build.html' do
  haml :build
end

get '/css.html' do
  haml :css
end

get "/stylesheets/inspector.css" do
  content_type 'text/css'
  sass :"stylesheets/inspector"
end