# jsHub Tag Inspector development

require 'rubygems'
require 'sinatra'
require 'haml'


get '/' do
  haml :index
end

get '/css.html' do
  haml :css
end

get "/stylesheets/inspector.css" do
  content_type 'text/css'
  sass :"stylesheets/inspector"
end